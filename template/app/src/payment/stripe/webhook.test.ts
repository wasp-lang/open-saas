import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriptionStatus } from "../plans";

const { sendMock, constructEventMock, updateUserSubscriptionMock } = vi.hoisted(
  () => ({
    sendMock: vi.fn(),
    constructEventMock: vi.fn(),
    updateUserSubscriptionMock: vi.fn(),
  }),
);

vi.mock("wasp/server", () => ({
  env: { STRIPE_WEBHOOK_SECRET: "whsec_test" },
}));
vi.mock("wasp/server/email", () => ({
  emailSender: { send: sendMock },
}));
vi.mock("./stripeApi", () => ({
  stripeApi: { webhooks: { constructEvent: constructEventMock } },
}));
vi.mock("../processedWebhookEvent", () => ({
  processWebhookEventOnce: vi.fn(
    async (
      _event: unknown,
      _delegate: unknown,
      handleEvent: () => Promise<void>,
    ) => handleEvent(),
  ),
}));
vi.mock("../user", () => ({
  updateUserCredits: vi.fn(),
  updateUserSubscription: updateUserSubscriptionMock,
}));
vi.mock("../paymentProcessorPlans", () => ({
  getPaymentPlanIdByPaymentProcessorPlanId: vi.fn(() => "pro"),
}));

import { stripeWebhook } from "./webhook";

function makeRequest() {
  return {
    body: Buffer.from("{}"),
    headers: { "stripe-signature": "sig_test" },
  };
}

function makeResponse() {
  const response = {
    status: vi.fn(),
    send: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
}

function makeSubscriptionUpdatedEvent({
  id,
  cancelAtPeriodEnd,
}: {
  id: string;
  cancelAtPeriodEnd: boolean;
}) {
  return {
    id,
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        cancel_at_period_end: cancelAtPeriodEnd,
        items: { data: [{ price: { id: "price_pro" } }] },
      },
    },
  };
}

// Simulates the `email` and `subscriptionStatus` columns the handler reads
// before updating.
function makeContext(initialStatus: string | null, email: string | null) {
  const stored = { email, subscriptionStatus: initialStatus };
  updateUserSubscriptionMock.mockImplementation(
    async (args: { subscriptionStatus: string }) => {
      stored.subscriptionStatus = args.subscriptionStatus;
      return { email: stored.email };
    },
  );
  const userDelegate = {
    findUniqueOrThrow: vi.fn(async () => ({
      email: stored.email,
      subscriptionStatus: stored.subscriptionStatus,
    })),
  };
  return {
    entities: { User: userDelegate, ProcessedWebhookEvent: {} },
  };
}

async function deliverEvent(context: unknown, event: unknown) {
  constructEventMock.mockReturnValueOnce(event);
  const response = makeResponse();
  await stripeWebhook(
    makeRequest() as unknown as Parameters<typeof stripeWebhook>[0],
    response as unknown as Parameters<typeof stripeWebhook>[1],
    context as unknown as Parameters<typeof stripeWebhook>[2],
  );
  return response;
}

describe("stripeWebhook customer.subscription.updated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the cancellation email when the subscription becomes scheduled to cancel", async () => {
    const context = makeContext(SubscriptionStatus.Active, "user@example.com");

    const response = await deliverEvent(
      context,
      makeSubscriptionUpdatedEvent({ id: "evt_1", cancelAtPeriodEnd: true }),
    );

    expect(response.status).toHaveBeenCalledWith(204);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "user@example.com" }),
    );
  });

  it("does not resend the email on later updates while cancellation stays scheduled", async () => {
    const context = makeContext(SubscriptionStatus.Active, "user@example.com");

    await deliverEvent(
      context,
      makeSubscriptionUpdatedEvent({ id: "evt_1", cancelAtPeriodEnd: true }),
    );
    await deliverEvent(
      context,
      makeSubscriptionUpdatedEvent({ id: "evt_2", cancelAtPeriodEnd: true }),
    );
    await deliverEvent(
      context,
      makeSubscriptionUpdatedEvent({ id: "evt_3", cancelAtPeriodEnd: true }),
    );

    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("does not send the email for ordinary updates to an active subscription", async () => {
    const context = makeContext(SubscriptionStatus.Active, "user@example.com");

    await deliverEvent(
      context,
      makeSubscriptionUpdatedEvent({ id: "evt_1", cancelAtPeriodEnd: false }),
    );

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends the email again if the subscription is reactivated and cancelled again", async () => {
    const context = makeContext(SubscriptionStatus.Active, "user@example.com");

    await deliverEvent(
      context,
      makeSubscriptionUpdatedEvent({ id: "evt_1", cancelAtPeriodEnd: true }),
    );
    await deliverEvent(
      context,
      makeSubscriptionUpdatedEvent({ id: "evt_2", cancelAtPeriodEnd: false }),
    );
    await deliverEvent(
      context,
      makeSubscriptionUpdatedEvent({ id: "evt_3", cancelAtPeriodEnd: true }),
    );

    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("retries the email when the first send fails, because the status is not updated yet", async () => {
    const context = makeContext(SubscriptionStatus.Active, "user@example.com");
    sendMock.mockRejectedValueOnce(new Error("SMTP unavailable"));
    const event = makeSubscriptionUpdatedEvent({
      id: "evt_1",
      cancelAtPeriodEnd: true,
    });

    // First delivery: send fails, the webhook reports an error and the
    // subscription status must stay untouched so the retry can resend.
    const failedResponse = await deliverEvent(context, event);
    expect(failedResponse.status).toHaveBeenCalledWith(400);
    expect(updateUserSubscriptionMock).not.toHaveBeenCalled();

    // Stripe retries the same event: the old status is still stored, so the
    // transition is detected again and the email send is retried.
    const retriedResponse = await deliverEvent(context, event);
    expect(retriedResponse.status).toHaveBeenCalledWith(204);
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(updateUserSubscriptionMock).toHaveBeenCalledTimes(1);
  });

  it("updates the status without sending the email when the user has no email address", async () => {
    const context = makeContext(SubscriptionStatus.Active, null);

    const response = await deliverEvent(
      context,
      makeSubscriptionUpdatedEvent({ id: "evt_1", cancelAtPeriodEnd: true }),
    );

    expect(response.status).toHaveBeenCalledWith(204);
    expect(updateUserSubscriptionMock).toHaveBeenCalledTimes(1);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
