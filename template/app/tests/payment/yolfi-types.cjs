// Focused type check of actual adapter modules and the upstream provider contract.
// Only generated Wasp/Prisma/Express declarations and the unselected Stripe server
// provider are declaration collaborators. This is NOT a full Wasp application build.
const path = require("node:path");
const ts = require(process.argv[2] || "typescript");
const app = path.resolve(__dirname, "../..");
const toolPackage = require.resolve(
  `${process.argv[2] || "typescript"}/package.json`,
);
const toolModules = path.dirname(path.dirname(toolPackage));
const declarationFile = path.join(__dirname, "yolfi-framework-contract.d.ts");
const stripeFile = path.join(__dirname, "yolfi-stripe-contract.d.ts");
const declarations = `
declare module "wasp/entities" {
  export interface User {
    id: string; email: string | null; paymentProcessorUserId: string | null;
    subscriptionStatus: string | null; subscriptionPlan: string | null;
    currentPeriodEnd: Date | null; cancelAtPeriodEnd: boolean;
  }
}
declare module "@prisma/client" {
  export class PrismaClient { user: any; processedWebhookEvent: any; }
  export namespace Prisma {
    class PrismaClientKnownRequestError extends Error { code: string; }
  }
}
declare module "wasp/server" {
  export { PrismaClient } from "@prisma/client";
  export const env: { YOLFI_API_KEY?: string; YOLFI_WEBHOOK_SECRET?: string };
  export const config: { frontendUrl: string };
  export class HttpError extends Error { constructor(statusCode: number, message: string); statusCode: number; }
  export type MiddlewareConfigFn = (config: Map<string, unknown>) => Map<string, unknown>;
  export const prisma: {
    processedWebhookEvent: { findUnique(args: { where: { paymentProcessorEventId: string } }): Promise<unknown> };
    $transaction<T>(callback: (tx: {
      processedWebhookEvent: { createMany(args: { data: { paymentProcessorEventId: string; eventType: string }[] }): Promise<unknown> };
      user: { update(args: { where: { id: string }; data: { credits: { increment: number }; datePaid: Date } }): Promise<unknown> };
    }) => Promise<T>): Promise<T>;
  };
}
declare module "wasp/server/api" {
  interface Response { status(code: number): Response; json(body: unknown): Response; }
  export type PaymentsWebhook = (request: { body: any; get(name: string): string | undefined }, response: Response, context: unknown) => Promise<Response>;
}
declare module "wasp/client/router" {
  export const routes: {
    CheckoutResultRoute: { build(args: { search: { status: string } }): string };
    AccountRoute: { to: string };
  };
}
declare module "wasp/server/email" { export const emailSender: { send(args: unknown): Promise<unknown> }; }
declare module "express" { const express: { raw(options: { type: string; limit: string }): unknown }; export default express; }
`;
const virtual = new Map([
  [declarationFile, declarations],
  [
    stripeFile,
    'export declare const stripePaymentProcessor: import("../../src/payment/paymentProcessor").PaymentProcessor;',
  ],
]);
const options = {
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  esModuleInterop: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  types: ["node"],
  typeRoots: [path.join(toolModules, "@types")],
};
const host = ts.createCompilerHost(options);
const originalRead = host.readFile.bind(host),
  originalExists = host.fileExists.bind(host);
host.readFile = (file) => virtual.get(file) ?? originalRead(file);
host.fileExists = (file) => virtual.has(file) || originalExists(file);
host.resolveModuleNames = (names, containing) =>
  names.map((name) => {
    if (
      name === "./stripe/paymentProcessor" &&
      containing.endsWith("/payment/paymentProcessor.ts")
    ) {
      return { resolvedFileName: stripeFile, extension: ts.Extension.Dts };
    }
    return ts.resolveModuleName(name, containing, options, host).resolvedModule;
  });
const roots = [
  "api.ts",
  "plan.ts",
  "paymentProcessor.ts",
  "paymentProcessorClient.ts",
  "webhook.ts",
].map((name) => path.join(app, "src/payment/yolfi", name));
const program = ts.createProgram([...roots, declarationFile], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
for (const diagnostic of diagnostics) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext([diagnostic], {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => app,
      getNewLine: () => "\n",
    }),
  );
}
console.log(
  `Focused adapter typecheck: TypeScript ${ts.version}; ${diagnostics.length} diagnostics (declaration collaborators, not a Wasp build).`,
);
process.exitCode = diagnostics.length ? 1 : 0;
