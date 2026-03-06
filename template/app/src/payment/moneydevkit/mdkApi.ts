import { createMdkExpressRouter } from "@moneydevkit/replit/server/express";
import type { MiddlewareConfigFn } from "wasp/server";

const mdkRouter = createMdkExpressRouter();

/**
 * Wasp apiNamespace middleware that mounts the MDK Express router.
 *
 * Because apiNamespace uses `router.use('/api/mdk', ...)` under the hood,
 * Express automatically strips the path prefix — the MDK router's internal
 * handlers (which listen on '/') match without any manual URL rewriting.
 */
export const mdkNamespaceMiddlewareFn: MiddlewareConfigFn = (
  middlewareConfig,
) => {
  // Remove Wasp's default JSON body parser — the MDK router includes its own
  // express.json() middleware. Having both causes "stream is not readable"
  // because the body stream gets consumed twice.
  middlewareConfig.delete("express.json");
  middlewareConfig.set("mdk-router", mdkRouter);
  return middlewareConfig;
};
