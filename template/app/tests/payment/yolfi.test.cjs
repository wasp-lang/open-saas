// Focused offline tests. HTTP, Wasp routing/env and Prisma are test collaborators.
// All payment/session/event data below are synthetic fixtures, not API observations.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { createHmac } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require(process.argv[2] || "typescript");
const app = path.resolve(__dirname, "../..");
const userId = "00000000-0000-4000-8000-000000000001";
const sessionId = "ycs_00000000000000000000000000000001";
const invoiceId = "00000000-0000-4000-8000-000000000002";
const orderId = "open-saas-00000000-0000-4000-8000-000000000003";
const secret = "EXAMPLE_WEBHOOK_SECRET";
const creditPlan = { id: "credits10", effect: { kind: "credits", amount: 10 } };

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
class PrismaError extends Error {
  constructor(code) {
    super("Test persistence error");
    this.code = code;
  }
}
function snapshot(overrides = {}) {
  return {
    id: sessionId,
    object: "checkout_session",
    status: "COMPLETED",
    amount: "9.99",
    currency: "USD",
    merchantOrderId: orderId,
    clientReferenceId: userId,
    metadata: { integration: "open-saas", paymentPlanId: "credits10" },
    url: `https://pay.yolfi.com/${sessionId}`,
    ...overrides,
  };
}
function event(overrides = {}) {
  return {
    id: "evt_00000000-0000-4000-8000-000000000004",
    type: "payment.confirmed",
    created: 1700000000,
    livemode: true,
    data: {
      invoiceId,
      checkoutSessionId: sessionId,
      merchantOrderId: orderId,
      paymentType: "ONE_TIME",
      status: "confirmed",
      currency: "USD",
      // Token receivable is deliberately NOT the USD checkout price.
      amount: "0.003",
      amountUsd: "9.80",
    },
    ...overrides,
  };
}
function setup() {
  const env = {
    YOLFI_API_KEY: "EXAMPLE_API_KEY",
    YOLFI_WEBHOOK_SECRET: secret,
  };
  const calls = [],
    grants = [],
    rows = new Map(),
    modules = new Map(),
    opened = [];
  const state = {
    reply: snapshot(),
    failure: null,
    fetch: null,
    failUpdate: false,
  };
  let lock = Promise.resolve();
  const prisma = {
    processedWebhookEvent: {
      findUnique: async ({ where }) =>
        rows.get(where.paymentProcessorEventId) || null,
    },
    $transaction: async (callback) => {
      // Serialize this test collaborator as a unique-index-backed transaction would.
      const before = lock;
      let release;
      lock = new Promise((resolve) => {
        release = resolve;
      });
      await before;
      const pending = new Map(rows),
        writes = [];
      const tx = {
        processedWebhookEvent: {
          createMany: async ({ data }) => {
            for (const row of data) {
              if (pending.has(row.paymentProcessorEventId))
                throw new PrismaError("P2002");
              pending.set(row.paymentProcessorEventId, row);
            }
          },
        },
        user: {
          update: async (args) => {
            if (state.failUpdate)
              throw new Error("Test transient persistence failure");
            assert.equal(args.where.id, userId);
            writes.push(args);
            return { id: userId };
          },
        },
      };
      try {
        const result = await callback(tx);
        rows.clear();
        for (const [key, value] of pending) rows.set(key, value);
        grants.push(...writes);
        return result;
      } finally {
        release();
      }
    },
  };
  const mocks = {
    "wasp/server": {
      env,
      config: { frontendUrl: "https://merchant.example.com" },
      HttpError,
      prisma,
    },
    "@prisma/client": {
      Prisma: { PrismaClientKnownRequestError: PrismaError },
    },
    "wasp/client/router": {
      routes: {
        CheckoutResultRoute: {
          build: ({ search }) => `/checkout?status=${search.status}`,
        },
        AccountRoute: { to: "/account" },
      },
    },
    express: { raw: (options) => ({ rawOptions: options }) },
  };
  const fakeFetch = async (url, options) => {
    calls.push({ url, options });
    if (state.fetch) return state.fetch(url, options, calls.length);
    if (state.failure) throw state.failure;
    const data =
      options.method === "POST"
        ? {
            ...snapshot({ status: "OPEN" }),
            ...JSON.parse(options.body),
            ...state.reply,
          }
        : state.reply;
    // Creation echoes the actual new order/user reference, as the documented API does.
    if (options.method === "POST")
      Object.assign(data, JSON.parse(options.body));
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  };
  function load(filename) {
    const resolved = path.resolve(filename);
    if (modules.has(resolved)) return modules.get(resolved).exports;
    const source = fs.readFileSync(resolved, "utf8");
    const compiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: resolved,
      reportDiagnostics: true,
    });
    const errors = (compiled.diagnostics || []).filter(
      (x) => x.category === ts.DiagnosticCategory.Error,
    );
    assert.deepEqual(
      errors,
      [],
      `TypeScript parse diagnostics in ${path.basename(resolved)}`,
    );
    const module = { exports: {} };
    modules.set(resolved, module);
    const localRequire = (specifier) => {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      if (specifier.startsWith(".")) {
        const file = path.resolve(path.dirname(resolved), specifier);
        return load(fs.existsSync(file) ? file : `${file}.ts`);
      }
      if (specifier.startsWith("node:")) return require(specifier);
      throw new Error(`Unmocked external collaborator: ${specifier}`);
    };
    const run = vm.runInNewContext(
      `(function(require,module,exports,Buffer,fetch,Headers,URL,AbortSignal,setTimeout,clearTimeout,console,window){${compiled.outputText}\n})`,
      {},
      { filename: resolved },
    );
    run(
      localRequire,
      module,
      module.exports,
      Buffer,
      fakeFetch,
      Headers,
      URL,
      AbortSignal,
      setTimeout,
      clearTimeout,
      console,
      { open: (...args) => opened.push(args) },
    );
    return module.exports;
  }
  const provider = () =>
    load(path.join(app, "src/payment/yolfi/paymentProcessor.ts"))
      .yolfiPaymentProcessor;
  const webhookModule = () =>
    load(path.join(app, "src/payment/yolfi/webhook.ts"));
  async function checkout(paymentPlan = creditPlan, id = userId) {
    return provider().createCheckoutSession({
      userId: id,
      userEmail: "buyer@example.com",
      paymentPlan,
      prismaUserDelegate: {},
    });
  }
  async function deliver(payload = event(), options = {}) {
    const body = options.raw || Buffer.from(JSON.stringify(payload));
    const signature =
      options.signature === undefined
        ? createHmac("sha256", secret).update(body).digest("base64")
        : options.signature;
    const response = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(value) {
        this.body = value;
        return this;
      },
    };
    await webhookModule().yolfiWebhook(
      {
        body: options.parsed ? payload : body,
        get: (name) =>
          name.toLowerCase() === "x-yolfi-signature" ? signature : undefined,
      },
      response,
      { entities: {} },
    );
    return response;
  }
  return {
    env,
    state,
    calls,
    grants,
    rows,
    provider,
    webhookModule,
    checkout,
    deliver,
    load,
    opened,
  };
}

test("actual client redirects and rejects unsupported in-page sessions", async () => {
  const h = setup(),
    client = h.load(
      path.join(app, "src/payment/yolfi/paymentProcessorClient.ts"),
    ).yolfiPaymentProcessorClient;
  assert.equal(client.id, "yolfi");
  await client.openCheckout({
    kind: "redirect",
    id: sessionId,
    url: `https://pay.yolfi.com/${sessionId}`,
  });
  assert.deepEqual(h.opened, [[`https://pay.yolfi.com/${sessionId}`, "_self"]]);
  await assert.rejects(
    client.openCheckout({ kind: "inPage", id: sessionId }),
    /no URL/,
  );
});
test("authored selection, environment and UI sources parse as TypeScript", () => {
  for (const name of [
    "env.ts",
    "payment/paymentProcessor.ts",
    "payment/paymentProcessorClient.ts",
    "payment/operations.ts",
    "payment/PricingPage.tsx",
    "payment/CheckoutResultPage.tsx",
    "payment/yolfi/env.ts",
  ]) {
    const file = path.join(app, "src", name);
    const result = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      fileName: file,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
      reportDiagnostics: true,
    });
    assert.equal(
      (result.diagnostics || []).filter(
        (item) => item.category === ts.DiagnosticCategory.Error,
      ).length,
      0,
      name,
    );
  }
});
test("creates a native decimal-USD hosted checkout with server-owned references", async () => {
  const h = setup();
  const result = await h.checkout();
  assert.equal(result.session.kind, "redirect");
  assert.equal(result.session.id, sessionId);
  const call = h.calls[0],
    body = JSON.parse(call.options.body);
  assert.equal(call.url, "https://app.yolfi.com/api/checkout-sessions");
  assert.equal(call.options.method, "POST");
  assert.equal(body.amount, "9.99");
  assert.equal(body.currency, "USD");
  assert.equal(body.clientReferenceId, userId);
  assert.match(body.merchantOrderId, /^open-saas-/);
  assert.equal(body.metadata.paymentPlanId, "credits10");
  assert.equal(body.metadata.integration, "open-saas");
  assert.equal(
    body.successUrl,
    "https://merchant.example.com/checkout?status=success",
  );
  assert.equal(
    body.cancelUrl,
    "https://merchant.example.com/checkout?status=canceled",
  );
  const headers = new Headers(call.options.headers);
  assert.equal(headers.get("Authorization"), "Bearer EXAMPLE_API_KEY");
  assert.ok(headers.get("Idempotency-Key").length >= 16);
  assert.ok(call.options.signal instanceof AbortSignal);
  assert.equal(h.grants.length, 0);
});
test("rejects subscriptions and invalid user references before HTTP", async () => {
  const h = setup();
  await assert.rejects(
    h.checkout({ id: "pro", effect: { kind: "subscription" } }),
    /one-time/i,
  );
  await assert.rejects(h.checkout(creditPlan, "invalid"), /reference/i);
  assert.equal(h.calls.length, 0);
});
test("requires separate configured API and endpoint credentials", async () => {
  const h = setup();
  delete h.env.YOLFI_API_KEY;
  await assert.rejects(h.checkout(), /configur/i);
  assert.equal(h.calls.length, 0);
  delete h.env.YOLFI_WEBHOOK_SECRET;
  const response = await h.deliver();
  assert.ok(response.statusCode >= 400);
  assert.equal(h.grants.length, 0);
});
test("retries transient creation once with identical body and idempotency key", async () => {
  const h = setup();
  h.state.fetch = async (_url, options, n) => {
    if (n === 1) throw new Error("Test timeout");
    return new Response(
      JSON.stringify({
        success: true,
        data: { ...snapshot(), ...JSON.parse(options.body) },
      }),
    );
  };
  await h.checkout();
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[0].options.body, h.calls[1].options.body);
  assert.equal(
    new Headers(h.calls[0].options.headers).get("Idempotency-Key"),
    new Headers(h.calls[1].options.headers).get("Idempotency-Key"),
  );
});
for (const status of [400, 401, 409, 429, 500]) {
  test(`handles HTTP ${status} without exposing response contents`, async () => {
    const h = setup();
    h.state.fetch = async () =>
      new Response("TEST_PRIVATE_RESPONSE", { status });
    await assert.rejects(
      h.checkout(),
      (error) => !error.message.includes("TEST_PRIVATE_RESPONSE"),
    );
    assert.equal(h.calls.length, status === 429 || status >= 500 ? 2 : 1);
  });
}
test("caps transport retries including aborts", async () => {
  const h = setup();
  h.state.failure = new Error("Test abort");
  await assert.rejects(h.checkout());
  assert.equal(h.calls.length, 2);
});
test("rejects malformed envelopes and unsafe hosted destinations", async () => {
  for (const body of [
    "not json",
    JSON.stringify({ success: false }),
    JSON.stringify({ data: snapshot() }),
  ]) {
    const h = setup();
    h.state.fetch = async () => new Response(body);
    await assert.rejects(h.checkout());
  }
  for (const url of [
    "javascript:alert(1)",
    "https://attacker.example.com/checkout",
    "http://pay.yolfi.com/checkout",
    Object.assign(new URL("https://pay.yolfi.com/checkout"), {
      username: "EXAMPLE_USERNAME",
    }).toString(),
  ]) {
    const h = setup();
    h.state.reply = snapshot({ url });
    await assert.rejects(h.checkout());
  }
});
test("rejects a created session with wrong source money or order", async () => {
  for (const changes of [
    { amount: "10.00" },
    { currency: "EUR" },
    { merchantOrderId: "wrong" },
  ]) {
    const h = setup();
    h.state.fetch = async (_url, options) =>
      new Response(
        JSON.stringify({
          success: true,
          data: { ...snapshot(), ...JSON.parse(options.body), ...changes },
        }),
      );
    await assert.rejects(h.checkout());
  }
});
test("verifies the raw-body HMAC, rejecting missing, malformed and tampered signatures", async () => {
  for (const signature of ["", "invalid", "A".repeat(44)]) {
    const h = setup();
    assert.equal((await h.deliver(event(), { signature })).statusCode, 400);
    assert.equal(h.calls.length, 0);
    assert.equal(h.grants.length, 0);
  }
  const h = setup();
  const raw = Buffer.from(JSON.stringify(event()));
  const signature = createHmac("sha256", secret)
    .update(raw)
    .digest("base64");
  assert.equal(
    (
      await h.deliver(event(), {
        raw: Buffer.concat([raw, Buffer.from(" ")]),
        signature,
      })
    ).statusCode,
    400,
  );
  assert.equal((await h.deliver(event(), { parsed: true })).statusCode, 400);
  assert.equal(h.grants.length, 0);
});
test("installs raw JSON middleware in place of parsed JSON", () => {
  const h = setup();
  const map = new Map([["express.json", {}]]);
  h.webhookModule().yolfiMiddlewareConfigFn(map);
  assert.equal(map.has("express.json"), false);
  assert.equal(map.get("express.raw").rawOptions.type, "application/json");
});
test("grants the one-time credits only after signed confirmation and snapshot correlation", async () => {
  const h = setup();
  assert.equal((await h.deliver()).statusCode, 200);
  assert.equal(
    h.calls[0].url,
    `https://app.yolfi.com/api/checkout-sessions/${sessionId}`,
  );
  assert.equal(h.calls[0].options.method, "GET");
  assert.equal(h.grants.length, 1);
  assert.equal(h.grants[0].data.credits.increment, 10);
  assert.equal(h.grants[0].where.id, userId);
  assert.equal(h.rows.size, 3);
});
test("does not grant on invoice creation, overdue, return URLs or a completed session alone", async () => {
  for (const type of [
    "invoice.created",
    "invoice.overdue",
    "checkout.completed",
  ]) {
    const h = setup();
    assert.equal((await h.deliver(event({ type }))).statusCode, 200);
    assert.equal(h.grants.length, 0);
    assert.equal(h.calls.length, 0);
  }
});
test("rejects false confirmations, recurring payments, test mode and malformed events", async () => {
  const good = event();
  for (const payload of [
    event({ livemode: false }),
    event({ id: "invalid" }),
    event({ created: -1 }),
    event({ data: { ...good.data, status: "pending" } }),
    event({ data: { ...good.data, paymentType: "RECURRING" } }),
    event({ data: { ...good.data, checkoutSessionId: "../invalid" } }),
    event({ data: { ...good.data, invoiceId: "invalid" } }),
  ]) {
    const h = setup();
    assert.ok((await h.deliver(payload)).statusCode >= 400);
    assert.equal(h.grants.length, 0);
  }
});
test("rejects mismatched source prices, currencies, sessions, plans and references", async () => {
  const changes = [
    { amount: "9.98" },
    { amount: "9.99001" },
    { amount: "NaN" },
    { currency: "EUR" },
    { id: "ycs_other" },
    { merchantOrderId: "open-saas-other" },
    { clientReferenceId: "invalid" },
    { status: "OPEN" },
    { metadata: { integration: "other", paymentPlanId: "credits10" } },
    { metadata: { integration: "open-saas", paymentPlanId: "pro" } },
  ];
  for (const change of changes) {
    const h = setup();
    h.state.reply = snapshot(change);
    assert.ok((await h.deliver()).statusCode >= 400, JSON.stringify(change));
    assert.equal(h.grants.length, 0);
  }
  const h = setup();
  const e = event();
  e.data.currency = "EUR";
  assert.ok((await h.deliver(e)).statusCode >= 400);
  assert.equal(h.grants.length, 0);
});
test("accepts equivalent decimal price spelling without comparing token amounts", async () => {
  const h = setup();
  h.state.reply = snapshot({ amount: "9.990000" });
  assert.equal((await h.deliver()).statusCode, 200);
  assert.equal(h.grants.length, 1);
});
test("deduplicates event retries and distinct events for the same checkout or invoice", async () => {
  const h = setup();
  await h.deliver();
  await h.deliver();
  await h.deliver(event({ id: "evt_00000000-0000-4000-8000-000000000005" }));
  assert.equal(h.grants.length, 1);
  const e = event({ id: "evt_00000000-0000-4000-8000-000000000006" });
  e.data.checkoutSessionId = "ycs_00000000000000000000000000000002";
  h.state.reply = snapshot({ id: e.data.checkoutSessionId });
  await h.deliver(e);
  assert.equal(h.grants.length, 1);
});
test("a distinct invoice cannot grant the same checkout twice", async () => {
  const h = setup();
  await h.deliver();
  const e = event({ id: "evt_00000000-0000-4000-8000-000000000008" });
  e.data.invoiceId = "00000000-0000-4000-8000-000000000009";
  assert.equal((await h.deliver(e)).statusCode, 200);
  assert.equal(h.grants.length, 1);
});
test("signed invalid JSON and oversized/invalid envelopes fail closed", async () => {
  const h = setup();
  assert.equal(
    (await h.deliver(null, { raw: Buffer.from("{") })).statusCode,
    400,
  );
  assert.equal(h.grants.length, 0);
  h.state.fetch = async () => new Response(" ".repeat(65537));
  await assert.rejects(h.checkout());
});
test("separate purchases get separate checkout references and keys", async () => {
  const h = setup();
  await h.checkout();
  await h.checkout();
  assert.notEqual(
    JSON.parse(h.calls[0].options.body).merchantOrderId,
    JSON.parse(h.calls[1].options.body).merchantOrderId,
  );
  assert.notEqual(
    new Headers(h.calls[0].options.headers).get("Idempotency-Key"),
    new Headers(h.calls[1].options.headers).get("Idempotency-Key"),
  );
});
test("concurrent distinct confirmation events cannot grant twice", async () => {
  const h = setup();
  const replies = await Promise.all([
    h.deliver(),
    h.deliver(event({ id: "evt_00000000-0000-4000-8000-000000000007" })),
  ]);
  assert.equal(replies[0].statusCode, 200);
  assert.equal(replies[1].statusCode, 200);
  assert.equal(h.grants.length, 1);
});
test("failed credit updates roll back deduplication so delivery can retry", async () => {
  const h = setup();
  h.state.failUpdate = true;
  assert.equal((await h.deliver()).statusCode, 503);
  assert.equal(h.rows.size, 0);
  assert.equal(h.grants.length, 0);
  h.state.failUpdate = false;
  assert.equal((await h.deliver()).statusCode, 200);
  assert.equal(h.grants.length, 1);
});
test("lookup transport errors produce retryable webhook failures without fulfillment", async () => {
  const h = setup();
  h.state.failure = new Error("Test timeout");
  const r = await h.deliver();
  assert.ok(r.statusCode >= 500);
  assert.equal(h.grants.length, 0);
  assert.equal(h.rows.size, 0);
});
test("unsupported subscription, portal and revenue capabilities are explicit", async () => {
  const h = setup();
  assert.equal(await h.provider().fetchCustomerPortalUrl({}), null);
  assert.equal(await h.provider().fetchSubscriptionState("synthetic"), null);
  await assert.rejects(h.provider().fetchTotalRevenue(), /not supported/i);
});
