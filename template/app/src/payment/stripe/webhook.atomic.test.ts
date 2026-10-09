import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriptionStatus } from "../plans";

const {
  sendMock,
  constructEventMock,
  processWebhookEventOnceMock,
  updateUserSubscriptionMock,
} = vi.hoisted(() => {
  const sendMock = vi.fn();
  const constructEventMock = vi.fn();
  const processWebhookEventOnceMock = vi.fn(
    async (
      _identity: unknown,
      _delegate: unknown,
      handleEvent: () => Promise<void>,
    ) => handleEvent(),
  );
  const updateUserSubscriptionMock = vi.fn();

  return {
    sendMock,
    constructEventMock,
    processWebhookEventOnceMock,
    updateUserSubscriptionMock,
  };
});

vi.mock("wasp/server", () => ({
  env: { STRIPE_WEBHOOK_SECRET: "whsec_test" },
}));

vi.mock("wasp/server/email", () => ({
  emailSender: { send: sendMock },
}));

vi.mock("../processedWebhookEvent", () => ({
  processWebhookEventOnce: processWebhookEventOnceMock,
}));

vi.mock("../paymentProcessorPlans", () => ({
  getPaymentPlanIdByPaymentProcessorPlanId: vi.fn(() => "pro"),
}));

vi.mock("../user", () => ({
  updateUserCredits: vi.fn(),
  updateUserSubscription: updateUserSubscriptionMock,
}));

vi.mock("./stripeClient", () => ({
  stripeClient: {
    webhooks: {
      constructEvent: constructEventMock,
    },
  },
}));

import { stripeWebhook } from "./webhook";

function makeResponse() {
  const response = {
    status: vi.fn(),
    send: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
}

function makeSubscriptionUpdatedEvent() {
  return {
    id: "evt_subscription_updated_1",
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        cancel_at_period_end: true,
        items: {
          data: [{ price: { id: "price_pro" } }],
        },
      },
    },
  };
}

describe("Stripe cancellation email concurrent events", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateUserSubscriptionMock.mockResolvedValue({
      email: "user@example.com",
      subscriptionStatus: SubscriptionStatus.CancelAtPeriodEnd,
    });
  });

  it("sends at most one cancellation email for two concurrent distinct events", async () => {
    const firstEvent = makeSubscriptionUpdatedEvent();
    const secondEvent = makeSubscriptionUpdatedEvent();
    secondEvent.id = "evt_subscription_updated_2";

    constructEventMock
      .mockReturnValueOnce(firstEvent)
      .mockReturnValueOnce(secondEvent);

    let storedStatus: SubscriptionStatus = SubscriptionStatus.Active;

    const userDelegate = {
      updateMany: vi.fn(async (args: any) => {
        const conditions = args.where.OR ?? [];
        const matchesStatus = conditions.some((condition: any) => {
          const filter = condition.subscriptionStatus;
          if (filter === null) return storedStatus === null;
          if (filter?.not !== undefined) {
            return storedStatus !== null && storedStatus !== filter.not;
          }
          return false;
        });

        if (args.where.paymentProcessorUserId !== "cus_123" || !matchesStatus) {
          return { count: 0 };
        }

        storedStatus = args.data.subscriptionStatus;
        return { count: 1 };
      }),
      findUniqueOrThrow: vi.fn(async () => ({
        email: "user@example.com",
        subscriptionStatus: storedStatus,
      })),
    };

    const makeRequest = () => ({
      body: Buffer.from("{}"),
      headers: { "stripe-signature": "sig_test" },
    });

    const context = {
      entities: {
        User: userDelegate,
        ProcessedWebhookEvent: {},
      },
    };

    const firstResponse = makeResponse();
    const secondResponse = makeResponse();

    await Promise.all([
      stripeWebhook(makeRequest() as any, firstResponse as any, context as any),
      stripeWebhook(
        makeRequest() as any,
        secondResponse as any,
        context as any,
      ),
    ]);

    expect(firstResponse.status).toHaveBeenCalledWith(204);
    expect(secondResponse.status).toHaveBeenCalledWith(204);
    expect(userDelegate.updateMany).toHaveBeenCalledTimes(2);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});
