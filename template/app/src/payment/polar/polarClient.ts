import { Polar } from "@polar-sh/sdk";
import { requireNodeEnvVar } from "../../server/utils";

export const polarClient = new Polar({
  accessToken: requireNodeEnvVar("POLAR_ORGANIZATION_ACCESS_TOKEN"),
  server:
    requireNodeEnvVar("POLAR_SANDBOX_MODE") === "true"
      ? "sandbox"
      : "production",
});
