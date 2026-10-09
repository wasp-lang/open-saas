import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { env } from "wasp/server";

export const paddleClient = new Paddle(env.PADDLE_API_KEY, {
  environment:
    env.PADDLE_SANDBOX_MODE === "true"
      ? Environment.sandbox
      : Environment.production,
});
