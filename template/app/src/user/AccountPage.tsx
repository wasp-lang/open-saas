import { getCustomerPortalUrl, useQuery } from "wasp/client/operations";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import type { User } from "wasp/entities";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../client/components/ui/card";
import { Separator } from "../client/components/ui/separator";
import {
  SubscriptionStatus,
  hasActiveSubscription,
  parsePaymentPlanId,
  prettyPaymentPlanName,
} from "../payment/plans";

export function AccountPage({ user }: { user: User }) {
  return (
    <div className="mt-10 px-6">
      <Card className="mb-4 lg:m-8">
        <CardHeader>
          <CardTitle className="text-foreground text-base font-semibold leading-6">
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {!!user.email && (
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                  <div className="text-muted-foreground text-sm font-medium">
                    Email address
                  </div>
                  <div className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                    {user.email}
                  </div>
                </div>
              </div>
            )}
            {!!user.username && (
              <>
                <Separator />
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                    <div className="text-muted-foreground text-sm font-medium">
                      Username
                    </div>
                    <div className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                      {user.username}
                    </div>
                  </div>
                </div>
              </>
            )}
            <Separator />
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                <div className="text-muted-foreground text-sm font-medium">
                  Your Plan
                </div>
                <UserCurrentSubscriptionPlan user={user} />
              </div>
            </div>
            <Separator />
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                <div className="text-muted-foreground text-sm font-medium">
                  Credits
                </div>
                <div className="text-foreground mt-1 text-sm sm:col-span-1 sm:mt-0">
                  {user.credits} credits
                </div>
                <div className="ml-auto mt-4 sm:mt-0">
                  <BuyMoreButton subscriptionStatus={user.subscriptionStatus} />
                </div>
              </div>
            </div>
            <Separator />
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                <div className="text-muted-foreground text-sm font-medium">
                  About
                </div>
                <div className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                  I'm a cool customer.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UserCurrentSubscriptionPlan({
  user,
}: {
  user: Pick<
    User,
    | "subscriptionPlan"
    | "subscriptionStatus"
    | "currentPeriodEnd"
    | "cancelAtPeriodEnd"
  >;
}) {
  return (
    <>
      <div className="text-foreground mt-1 text-sm sm:col-span-1 sm:mt-0">
        {formatSubscriptionMessage(user)}
      </div>
      <div className="ml-auto mt-4 sm:mt-0">
        <CustomerPortalButton />
      </div>
    </>
  );
}

function formatSubscriptionMessage({
  subscriptionPlan,
  subscriptionStatus,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: Pick<
  User,
  | "subscriptionPlan"
  | "subscriptionStatus"
  | "currentPeriodEnd"
  | "cancelAtPeriodEnd"
>): string {
  if (subscriptionPlan === null || subscriptionStatus === null) {
    return "Free Plan";
  }

  const paymentPlanName = prettyPaymentPlanName(
    parsePaymentPlanId(subscriptionPlan),
  );
  const endOfBillingPeriod = currentPeriodEnd?.toLocaleDateString();

  if (hasActiveSubscription({ subscriptionStatus }) && cancelAtPeriodEnd) {
    const endDateSuffix = endOfBillingPeriod ? `: ${endOfBillingPeriod}` : "";
    return `Your ${paymentPlanName} plan subscription has been canceled, but remains active until the end of the current billing period${endDateSuffix}`;
  }

  const trialEndSuffix = endOfBillingPeriod
    ? ` until ${endOfBillingPeriod}`
    : "";
  const statusToMessage: Record<SubscriptionStatus, string> = {
    active: `${paymentPlanName}`,
    trialing: `${paymentPlanName} (free trial${trialEndSuffix})`,
    past_due: `Payment for your ${paymentPlanName} plan is past due! Please update your subscription payment information.`,
    paused: `Your ${paymentPlanName} plan subscription is paused.`,
    canceled: `Your previous subscription has been canceled and is no longer active.`,
  };

  const message = statusToMessage[subscriptionStatus as SubscriptionStatus];
  if (!message) {
    throw new Error(`Invalid subscription status: ${subscriptionStatus}`);
  }

  return message;
}

function CustomerPortalButton() {
  const { data: customerPortalUrl, isLoading: isCustomerPortalUrlLoading } =
    useQuery(getCustomerPortalUrl);

  if (!customerPortalUrl) {
    return null;
  }

  return (
    <a href={customerPortalUrl} target="_blank" rel="noopener noreferrer">
      <Button disabled={isCustomerPortalUrlLoading} variant="link">
        Manage Payment Details
      </Button>
    </a>
  );
}

function BuyMoreButton({
  subscriptionStatus,
}: Pick<User, "subscriptionStatus">) {
  if (hasActiveSubscription({ subscriptionStatus })) {
    return null;
  }

  return (
    <WaspRouterLink
      to={routes.PricingPageRoute.to}
      className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
    >
      <Button variant="link">Buy More Credits</Button>
    </WaspRouterLink>
  );
}
