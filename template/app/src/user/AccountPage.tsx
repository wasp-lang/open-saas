import { getCustomerPortalUrl, useQuery } from "wasp/client/operations";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import type { User } from "wasp/entities";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import {
  SubscriptionStatus,
  parsePaymentPlanId,
  prettyPaymentPlanName,
} from "../payment/plans";

export default function AccountPage({ user }: { user: User }) {
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
                  <dt className="text-muted-foreground text-sm font-medium">
                    Email address
                  </dt>
                  <dd className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                    {user.email}
                  </dd>
                </div>
              </div>
            )}
            {!!user.username && (
              <>
                <Separator />
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                    <dt className="text-muted-foreground text-sm font-medium">
                      Username
                    </dt>
                    <dd className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                      {user.username}
                    </dd>
                  </div>
                </div>
              </>
            )}
            <Separator />
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                <dt className="text-muted-foreground text-sm font-medium">
                  Your Plan
                </dt>
                <UserCurrentPaymentPlan
                  subscriptionStatus={
                    user.subscriptionStatus as SubscriptionStatus
                  }
                  subscriptionPlan={user.subscriptionPlan}
                  datePaid={user.datePaid}
                  credits={user.credits}
                />
              </div>
            </div>
            <Separator />
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-4">
                <dt className="text-muted-foreground text-sm font-medium">
                  About
                </dt>
                <dd className="text-foreground mt-1 text-sm sm:col-span-2 sm:mt-0">
                  I'm a cool customer.
                </dd>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type UserCurrentPaymentPlanProps = {
  subscriptionPlan: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  datePaid: Date | null;
  credits: number;
};

function UserCurrentPaymentPlan({
  subscriptionPlan,
  subscriptionStatus,
  datePaid,
  credits,
}: UserCurrentPaymentPlanProps) {
  if (subscriptionStatus && subscriptionPlan && datePaid) {
    return (
      <>
        <dd className="text-foreground mt-1 text-sm sm:col-span-1 sm:mt-0">
          {getUserSubscriptionStatusDescription({
            subscriptionPlan,
            subscriptionStatus,
            datePaid,
          })}
        </dd>
        {subscriptionStatus !== SubscriptionStatus.Deleted ? (
          <CustomerPortalButton />
        ) : (
          <BuyMoreButton />
        )}
      </>
    );
  }

  return (
    <>
      <dd className="text-foreground mt-1 text-sm sm:col-span-1 sm:mt-0">
        Credits remaining: {credits}
      </dd>
      <BuyMoreButton />
    </>
  );
}

function getUserSubscriptionStatusDescription({
  subscriptionPlan,
  subscriptionStatus,
  datePaid,
}: {
  subscriptionPlan: string;
  subscriptionStatus: SubscriptionStatus;
  datePaid: Date;
}) {
  const planName = prettyPaymentPlanName(parsePaymentPlanId(subscriptionPlan));
  const endOfBillingPeriod = prettyPrintEndOfBillingPeriod(datePaid);
  return prettyPrintStatus(planName, subscriptionStatus, endOfBillingPeriod);
}

function prettyPrintStatus(
  planName: string,
  subscriptionStatus: SubscriptionStatus,
  endOfBillingPeriod: string,
): string {
  const statusToMessage: Record<SubscriptionStatus, string> = {
    active: `${planName}`,
    past_due: `Payment for your ${planName} plan is past due! Please update your subscription payment information.`,
    cancel_at_period_end: `Your ${planName} plan subscription has been canceled, but remains active until the end of the current billing period${endOfBillingPeriod}`,
    deleted: `Your previous subscription has been canceled and is no longer active.`,
  };
  if (Object.keys(statusToMessage).includes(subscriptionStatus)) {
    return statusToMessage[subscriptionStatus];
  } else {
    throw new Error(`Invalid subscriptionStatus: ${subscriptionStatus}`);
  }
}

function prettyPrintEndOfBillingPeriod(date: Date) {
  const oneMonthFromNow = new Date(date);
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  return ": " + oneMonthFromNow.toLocaleDateString();
}

function BuyMoreButton() {
  return (
    <div className="ml-4 flex-shrink-0 sm:col-span-1 sm:mt-0">
      <WaspRouterLink
        to={routes.PricingPageRoute.to}
        className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
      >
        Buy More/Upgrade
      </WaspRouterLink>
    </div>
  );
}

function CustomerPortalButton() {
  const {
    data: customerPortalUrl,
    isLoading: isCustomerPortalUrlLoading,
    error: customerPortalUrlError,
  } = useQuery(getCustomerPortalUrl);

  const handleClick = () => {
    if (customerPortalUrlError) {
      console.error("Error fetching customer portal url");
    }

    if (customerPortalUrl) {
      window.open(customerPortalUrl, "_blank");
    } else {
      console.error("Customer portal URL is not available");
    }
  };

  return (
    <div className="ml-4 flex-shrink-0 sm:col-span-1 sm:mt-0">
      <Button
        onClick={handleClick}
        disabled={isCustomerPortalUrlLoading}
        variant="outline"
        size="sm"
        className="text-sm font-medium"
      >
        Manage Subscription
      </Button>
    </div>
  );
}
