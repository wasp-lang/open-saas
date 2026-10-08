import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { env } from "wasp/client";
import { routes } from "wasp/client/router";
import { CheckoutResult } from "../CheckoutResultPage";
import type { OpenInPageCheckout } from "../inPageCheckout";

let paddle: Paddle | undefined;

async function getPaddle(): Promise<Paddle> {
  if (paddle) {
    return paddle;
  }

  const initializedPaddle = await initializePaddle({
    token: env.REACT_APP_PADDLE_CLIENT_TOKEN,
    environment:
      env.REACT_APP_PADDLE_SANDBOX_MODE === "true" ? "sandbox" : "production",
  });

  if (!initializedPaddle) {
    throw new Error("Failed to initialize Paddle.js");
  }

  paddle = initializedPaddle;
  return paddle;
}

export const openPaddleCheckout: OpenInPageCheckout = async (transactionId) => {
  const paddle = await getPaddle();
  paddle.Checkout.open({
    transactionId,
    settings: {
      variant: "one-page",
      successUrl: `${window.location.origin}${routes.CheckoutResultRoute.build({
        search: { status: CheckoutResult.Success },
      })}`,
    },
  });
};
