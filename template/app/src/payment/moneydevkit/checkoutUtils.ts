import { config } from "wasp/server";
import { requireNodeEnvVar } from "../../server/utils";

interface CreateMdkCheckoutSessionArgs {
  productId: string;
  customerEmail: string;
  userId: string;
}

interface MdkCheckoutSession {
  url: string;
  id: string;
}

/**
 * Creates an MDK checkout session by making an internal POST to the MDK Express router
 * mounted at /api/mdk. Uses the MDK_ACCESS_TOKEN header for server-to-server auth.
 *
 * The MDK router creates a checkout on the MDK platform and returns the checkout object.
 * We then construct a frontend URL pointing to the MdkCheckoutPage where the <Checkout />
 * component renders the payment UI.
 */
export async function createMdkCheckoutSession({
  productId,
  customerEmail,
  userId,
}: CreateMdkCheckoutSessionArgs): Promise<MdkCheckoutSession> {
  const accessToken = requireNodeEnvVar("MDK_ACCESS_TOKEN");

  const response = await fetch(`${config.serverUrl}/api/mdk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-moneydevkit-webhook-secret": accessToken,
    },
    body: JSON.stringify({
      handler: "create_checkout",
      params: {
        type: "PRODUCTS",
        product: productId,
        successUrl: `${config.frontendUrl}/checkout?status=success`,
        customer: {
          email: customerEmail,
          externalId: userId,
        },
        metadata: { userId: userId },
      },
    }),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    let errorMessage: string;
    try {
      const errorBody = JSON.parse(responseText);
      errorMessage = errorBody.error || errorBody.message || responseText;
    } catch {
      errorMessage = responseText || `status ${response.status}`;
    }
    console.error(`MDK checkout failed (${response.status}):`, errorMessage);
    throw new Error(`MDK checkout creation failed: ${errorMessage}`);
  }

  const body = await response.json();
  const checkout = body.data;

  if (!checkout?.id) {
    throw new Error("MDK checkout response missing checkout ID");
  }

  return {
    url: `${config.frontendUrl}/mdk-checkout/${checkout.id}`,
    id: checkout.id,
  };
}
