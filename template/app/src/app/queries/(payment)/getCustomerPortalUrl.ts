import { HttpError } from "wasp/server";
import { type GetCustomerPortalUrl } from "wasp/server/operations";
import { paymentProcessor } from "../../../payment/paymentProcessor";

const getCustomerPortalUrl: GetCustomerPortalUrl<void, string | null> = async (
  _args,
  context,
) => {
  if (!context.user) {
    throw new HttpError(
      401,
      "Only authenticated users are allowed to perform this operation",
    );
  }

  return paymentProcessor.fetchCustomerPortalUrl({
    userId: context.user.id,
    prismaUserDelegate: context.entities.User,
  });
};

export default getCustomerPortalUrl;
