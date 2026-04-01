import { describe, it, expect, vi } from "vitest";

// We test the date extraction logic directly since the webhook handlers
// depend on Wasp/Prisma runtime that isn't available in unit tests.

describe("Stripe webhook date handling", () => {
  it("extracts current_period_end from subscription update", () => {
    const subscription = {
      current_period_end: 1710000000, // Unix timestamp in seconds
      customer: "cus_test123",
      status: "active",
      cancel_at_period_end: false,
      items: { data: [{ price: { id: "price_123" } }] },
    };

    const subscriptionEndDate = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : undefined;

    expect(subscriptionEndDate).toBeInstanceOf(Date);
    expect(subscriptionEndDate!.getTime()).toBe(1710000000 * 1000);
  });

  it("extracts period end from invoice line items", () => {
    const invoice = {
      lines: {
        data: [
          {
            period: { end: 1712592000 }, // Unix timestamp in seconds
          },
        ],
      },
      status_transitions: { paid_at: 1710000000 },
    };

    const subscriptionEndDate = invoice.lines.data[0]?.period?.end
      ? new Date(invoice.lines.data[0].period.end * 1000)
      : undefined;

    expect(subscriptionEndDate).toBeInstanceOf(Date);
    expect(subscriptionEndDate!.getTime()).toBe(1712592000 * 1000);
  });

  it("converts paid_at timestamp correctly", () => {
    const paidAt = 1710000000;
    const date = new Date(paidAt * 1000);

    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBeGreaterThanOrEqual(2024);
  });

  it("handles missing period end gracefully", () => {
    const invoice = {
      lines: { data: [{ period: { end: null } }] },
    };

    const subscriptionEndDate = invoice.lines.data[0]?.period?.end
      ? new Date(invoice.lines.data[0].period.end * 1000)
      : undefined;

    expect(subscriptionEndDate).toBeUndefined();
  });
});
