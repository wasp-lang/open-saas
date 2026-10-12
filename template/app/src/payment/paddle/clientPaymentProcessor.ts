import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { env } from "wasp/client";
import { routes } from "wasp/client/router";
import { CheckoutResult } from "../CheckoutResultPage";
import type { ClientPaymentProcessor } from "../clientPaymentProcessor";

export const paddleClientPaymentProcessor: ClientPaymentProcessor = {
  id: "paddle",
  openCheckout: async (session) => {
    if (session.kind !== "inPage") {
      throw new Error("Paddle checkout session must be an in-page session");
    }

    const successUrlPath = routes.CheckoutResultRoute.build({
      search: { status: CheckoutResult.Success },
    });

    const paddle = await getPaddleBrowserClient();
    paddle.Checkout.open({
      transactionId: session.id,
      settings: {
        variant: "one-page",
        successUrl: `${window.location.origin}${successUrlPath}`,
      },
    });
  },
};

let paddleBrowserClient: Paddle | undefined;

async function getPaddleBrowserClient(): Promise<Paddle> {
  if (paddleBrowserClient) {
    return paddleBrowserClient;
  }

  const paddle = await initializePaddle({
    token: env.REACT_APP_PADDLE_CLIENT_TOKEN,
    environment:
      env.REACT_APP_PADDLE_SANDBOX_MODE === "true" ? "sandbox" : "production",
  });

  if (!paddle) {
    throw new Error("Failed to initialize Paddle.js");
  }

  paddleBrowserClient = paddle;
  return paddleBrowserClient;
}
