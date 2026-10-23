import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { env } from "wasp/client";
import { routes } from "wasp/client/router";
import { CheckoutResult } from "../CheckoutResultPage";
import type { PaymentProcessorClient } from "../paymentProcessorClient";

export const paddlePaymentProcessorClient: PaymentProcessorClient = {
  id: "paddle",
  openCheckout: async (session) => {
    if (session.kind !== "inPage") {
      throw new Error("Paddle checkout session must be an in-page session");
    }

    const successUrlPath = routes.CheckoutResultRoute.build({
      search: { status: CheckoutResult.Success },
    });

    const paddle = await getPaddleJs();
    paddle.Checkout.open({
      transactionId: session.id,
      settings: {
        variant: "one-page",
        successUrl: `${window.location.origin}${successUrlPath}`,
      },
    });
  },
};

let paddleJs: Paddle | undefined;

async function getPaddleJs(): Promise<Paddle> {
  if (paddleJs) {
    return paddleJs;
  }

  const paddle = await initializePaddle({
    token: env.REACT_APP_PADDLE_CLIENT_TOKEN,
    environment:
      env.REACT_APP_PADDLE_SANDBOX_MODE === "true" ? "sandbox" : "production",
  });

  if (!paddle) {
    throw new Error("Failed to initialize Paddle.js");
  }

  paddleJs = paddle;
  return paddleJs;
}
