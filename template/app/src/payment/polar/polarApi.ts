import { Polar } from "@polar-sh/sdk";
import { env } from "wasp/server";

export const polarApi = new Polar({
  accessToken: env.POLAR_ORGANIZATION_ACCESS_TOKEN,
  server: env.POLAR_SANDBOX_MODE === "true" ? "sandbox" : "production",
});
