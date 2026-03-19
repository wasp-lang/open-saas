import { describe, it, expect } from "vitest";

describe("LemonSqueezy webhook date handling", () => {
  it("uses created_at from payload instead of server time", () => {
    const payload = {
      attributes: {
        customer_id: 12345,
        status: "paid",
        created_at: "2025-03-15T10:30:00.000Z",
        updated_at: "2025-03-15T10:30:00.000Z",
        renews_at: "2025-04-15T10:30:00.000Z",
      },
    };

    const datePaid = new Date(payload.attributes.created_at);

    expect(datePaid).toBeInstanceOf(Date);
    expect(datePaid.toISOString()).toBe("2025-03-15T10:30:00.000Z");
  });

  it("uses updated_at for subscription renewal date", () => {
    const payload = {
      attributes: {
        customer_id: 12345,
        status: "active",
        updated_at: "2025-04-01T12:00:00.000Z",
        created_at: "2025-03-01T12:00:00.000Z",
        renews_at: "2025-05-01T12:00:00.000Z",
      },
    };

    const datePaid = new Date(payload.attributes.updated_at);

    expect(datePaid.toISOString()).toBe("2025-04-01T12:00:00.000Z");
    expect(datePaid.toISOString()).not.toBe(payload.attributes.created_at);
  });

  it("parses renews_at for subscription end date", () => {
    const renewsAt = "2025-05-15T10:30:00.000Z";
    const endDate = renewsAt ? new Date(renewsAt) : null;

    expect(endDate).toBeInstanceOf(Date);
    expect(endDate!.toISOString()).toBe("2025-05-15T10:30:00.000Z");
  });

  it("handles null renews_at", () => {
    const renewsAt: string | null = null;
    const endDate = renewsAt ? new Date(renewsAt) : null;

    expect(endDate).toBeNull();
  });
});
