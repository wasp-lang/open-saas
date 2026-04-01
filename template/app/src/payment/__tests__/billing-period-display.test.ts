import { describe, it, expect } from "vitest";

// Mirrors the formatBillingPeriodEnd logic from AccountPage.tsx
function formatBillingPeriodEnd(
  datePaid: Date,
  subscriptionEndDate: Date | null
): string {
  if (subscriptionEndDate) {
    return subscriptionEndDate.toLocaleDateString();
  }
  const estimated = new Date(datePaid);
  estimated.setMonth(estimated.getMonth() + 1);
  return estimated.toLocaleDateString();
}

describe("formatBillingPeriodEnd", () => {
  it("uses subscriptionEndDate when available", () => {
    const datePaid = new Date("2025-01-15");
    const endDate = new Date("2025-02-15");

    const result = formatBillingPeriodEnd(datePaid, endDate);

    expect(result).toBe(endDate.toLocaleDateString());
  });

  it("falls back to datePaid + 1 month when subscriptionEndDate is null", () => {
    const datePaid = new Date("2025-03-10");
    const result = formatBillingPeriodEnd(datePaid, null);

    const expected = new Date("2025-03-10");
    expected.setMonth(expected.getMonth() + 1);
    expect(result).toBe(expected.toLocaleDateString());
  });

  it("avoids month-overflow bug with real subscriptionEndDate", () => {
    // Jan 31 + 1 month = March 2-3 (JS bug), but real end date is Feb 28
    const datePaid = new Date("2025-01-31");
    const realEndDate = new Date("2025-02-28");

    const withRealDate = formatBillingPeriodEnd(datePaid, realEndDate);
    const withFallback = formatBillingPeriodEnd(datePaid, null);

    // Real date gives Feb 28, fallback gives March 2-3 (wrong)
    expect(withRealDate).toBe(realEndDate.toLocaleDateString());
    expect(withRealDate).not.toBe(withFallback);
  });

  it("handles year boundary correctly with real end date", () => {
    const datePaid = new Date("2025-12-15");
    const endDate = new Date("2026-01-15");

    const result = formatBillingPeriodEnd(datePaid, endDate);

    expect(result).toBe(endDate.toLocaleDateString());
  });
});
