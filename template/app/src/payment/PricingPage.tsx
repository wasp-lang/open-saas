import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "wasp/client/auth";
import {
  generateCheckoutSession,
  getCustomerPortalUrl,
  useQuery,
} from "wasp/client/operations";
import { Alert, AlertDescription } from "../client/components/ui/alert";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "../client/components/ui/card";
import { cn } from "../client/utils";
import {
  PaymentPlanId,
  prettyPaymentPlanName,
  SubscriptionStatus,
} from "./plans";

const bestDealPaymentPlanId: PaymentPlanId = PaymentPlanId.Professional;

interface TierCard {
  id: PaymentPlanId | "free";
  name: string;
  price: string;
  priceSuffix: string;
  description: string;
  features: string[];
  ctaLabel?: string;
}

const subscriptionTiers: TierCard[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceSuffix: "/mo",
    description: "Kick the tires. No credit card required.",
    features: [
      "5 credits on signup",
      "Full underwriting engine",
      "Loan sizing + debt analysis",
      "Community support",
    ],
    ctaLabel: "Sign up free",
  },
  {
    id: PaymentPlanId.Starter,
    name: prettyPaymentPlanName(PaymentPlanId.Starter),
    price: "$49",
    priceSuffix: "/mo",
    description: "For individual brokers and junior analysts.",
    features: [
      "50 credits per month",
      "Underwriting pro forma (10-yr)",
      "Debt sizing & term sheets",
      "T-12 / rent roll extraction",
      "Email support",
    ],
  },
  {
    id: PaymentPlanId.Professional,
    name: prettyPaymentPlanName(PaymentPlanId.Professional),
    price: "$199",
    priceSuffix: "/mo",
    description: "For acquisitions teams running multiple deals a month.",
    features: [
      "250 credits per month",
      "Everything in Starter",
      "Investment committee memos",
      "Sensitivity analysis",
      "Multi-scenario loan comparison",
      "Priority support",
    ],
  },
  {
    id: PaymentPlanId.Enterprise,
    name: prettyPaymentPlanName(PaymentPlanId.Enterprise),
    price: "$799",
    priceSuffix: "/mo",
    description: "For funds, REITs, and lenders underwriting at scale.",
    features: [
      "1,500 credits per month",
      "Everything in Professional",
      "Dedicated model tuning",
      "Portfolio-level analytics",
      "SSO & audit logs (on request)",
      "White-glove onboarding",
    ],
  },
];

const creditPackTiers: TierCard[] = [
  {
    id: PaymentPlanId.Credits25,
    name: "25 Credit Pack",
    price: "$39",
    priceSuffix: "",
    description: "Top up when you run short.",
    features: ["25 one-time credits", "No expiration", "Works with any plan"],
  },
  {
    id: PaymentPlanId.Credits100,
    name: "100 Credit Pack",
    price: "$129",
    priceSuffix: "",
    description: "Best for busy months.",
    features: [
      "100 one-time credits",
      "~$1.29 per credit",
      "No expiration",
    ],
  },
  {
    id: PaymentPlanId.Credits500,
    name: "500 Credit Pack",
    price: "$499",
    priceSuffix: "",
    description: "Stock up and save.",
    features: [
      "500 one-time credits",
      "~$1.00 per credit",
      "No expiration",
    ],
  },
];

const PricingPage = () => {
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: user } = useAuth();
  const isUserSubscribed =
    !!user &&
    !!user.subscriptionStatus &&
    user.subscriptionStatus !== SubscriptionStatus.Deleted;

  const {
    data: customerPortalUrl,
    isLoading: isCustomerPortalUrlLoading,
    error: customerPortalUrlError,
  } = useQuery(getCustomerPortalUrl, { enabled: isUserSubscribed });

  const navigate = useNavigate();

  async function handleBuyNowClick(tier: TierCard) {
    if (tier.id === "free") {
      navigate(user ? "/underwriting" : "/signup");
      return;
    }
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setIsPaymentLoading(true);
      const checkoutResults = await generateCheckoutSession(tier.id);
      if (checkoutResults?.sessionUrl) {
        window.open(checkoutResults.sessionUrl, "_self");
      } else {
        throw new Error("Error generating checkout session URL");
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Error processing payment. Please try again later.");
      }
      setIsPaymentLoading(false);
    }
  }

  const handleCustomerPortalClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (customerPortalUrlError) {
      setErrorMessage("Error fetching Customer Portal URL");
      return;
    }
    if (!customerPortalUrl) {
      setErrorMessage(`Customer Portal does not exist for user ${user.id}`);
      return;
    }
    window.open(customerPortalUrl, "_blank");
  };

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div id="pricing" className="mx-auto max-w-4xl text-center">
          <h2 className="text-foreground mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Replace your analyst.{" "}
            <span className="text-primary">Keep the upside.</span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8">
            Every plan includes monthly credits. Each underwriting run, debt
            scenario, or document extraction consumes 1 credit. Top up anytime
            with an add-on pack.
          </p>
        </div>
        {errorMessage && (
          <Alert variant="destructive" className="mt-8">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-x-6">
          {subscriptionTiers.map((tier) => {
            const isBestDeal = tier.id === bestDealPaymentPlanId;
            return (
              <Card
                key={tier.id}
                className={cn(
                  "relative flex grow flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg",
                  {
                    "ring-primary bg-transparent! ring-2": isBestDeal,
                    "ring-border ring-1 lg:my-8": !isBestDeal,
                  },
                )}
              >
                {isBestDeal && (
                  <div className="bg-primary text-primary-foreground absolute right-4 top-4 rounded-full px-2 py-0.5 text-xs font-semibold">
                    Most popular
                  </div>
                )}
                <CardContent className="h-full justify-between p-6 xl:p-8">
                  <CardTitle className="text-foreground text-lg font-semibold leading-8">
                    {tier.name}
                  </CardTitle>
                  <p className="text-muted-foreground mt-4 text-sm leading-6">
                    {tier.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-foreground text-4xl font-bold tracking-tight">
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground text-sm font-semibold leading-6">
                      {tier.priceSuffix}
                    </span>
                  </p>
                  <ul
                    role="list"
                    className="text-muted-foreground mt-8 space-y-3 text-sm leading-6"
                  >
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckCircle
                          className="text-primary h-5 w-5 flex-none"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isUserSubscribed && tier.id !== "free" ? (
                    <Button
                      onClick={handleCustomerPortalClick}
                      disabled={isCustomerPortalUrlLoading}
                      variant={isBestDeal ? "default" : "outline"}
                      className="w-full"
                    >
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleBuyNowClick(tier)}
                      variant={isBestDeal ? "default" : "outline"}
                      className="w-full"
                      disabled={isPaymentLoading}
                    >
                      {tier.ctaLabel ??
                        (user ? "Subscribe" : "Log in to subscribe")}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mx-auto mt-20 max-w-4xl text-center">
          <h3 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Run out mid-deal? <span className="text-primary">Top up.</span>
          </h3>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-7">
            One-time credit packs stack on top of any plan — including Free.
            Credits never expire.
          </p>
        </div>

        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-6 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-6">
          {creditPackTiers.map((tier) => (
            <Card
              key={tier.id}
              className="ring-border relative flex grow flex-col justify-between overflow-hidden ring-1 transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-6 xl:p-8">
                <CardTitle className="text-foreground text-lg font-semibold leading-8">
                  {tier.name}
                </CardTitle>
                <p className="text-muted-foreground mt-4 text-sm leading-6">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-foreground text-4xl font-bold tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground text-sm font-semibold leading-6">
                    {tier.priceSuffix}
                  </span>
                </p>
                <ul
                  role="list"
                  className="text-muted-foreground mt-6 space-y-3 text-sm leading-6"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckCircle
                        className="text-primary h-5 w-5 flex-none"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleBuyNowClick(tier)}
                  variant="outline"
                  className="w-full"
                  disabled={isPaymentLoading}
                >
                  {user ? "Buy credits" : "Log in to buy"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-muted-foreground mx-auto mt-10 max-w-2xl text-center text-sm">
          Test card: {" "}
          <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 font-mono">
            4242 4242 4242 4242
          </span>
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
