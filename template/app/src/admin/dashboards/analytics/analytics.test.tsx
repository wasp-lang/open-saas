import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { type DailyStats } from "wasp/entities";
import { RevenueAndProfitChart } from "./RevenueAndProfitChart";
import { TotalRevenueCard } from "./TotalRevenueCard";

vi.mock("react-apexcharts", () => ({ default: () => null }));

function dailyStat(id: number, date: string, totalRevenue: number): DailyStats {
  return {
    id,
    date: new Date(date),
    totalRevenue,
    totalProfit: 0,
    totalViews: 0,
    prevDayViewsChangePercent: "0",
    userCount: 0,
    paidUserCount: 0,
    userDelta: 0,
    paidUserDelta: 0,
  };
}

describe("dashboard revenue statistics", () => {
  it.each([true, false])(
    "renders both widgets without changing shared query data (chart first: %s)",
    (chartFirst) => {
      // IDs deliberately differ from date order, as with backfilled statistics.
      const weeklyStats = [
        dailyStat(1, "2026-11-09", 150),
        dailyStat(3, "2026-11-08", 100),
        dailyStat(2, "2026-11-07", 80),
      ];
      Object.freeze(weeklyStats);
      const originalOrder = [...weeklyStats];
      const card = <TotalRevenueCard key="card" weeklyStats={weeklyStats} />;
      const chart = (
        <RevenueAndProfitChart key="chart" weeklyStats={weeklyStats} />
      );

      const html = renderToStaticMarkup(
        <>{chartFirst ? [chart, card] : [card, chart]}</>,
      );

      expect(html).toContain("50%");
      expect(html).toContain("lucide-arrow-up");
      expect(weeklyStats).toEqual(originalOrder);
    },
  );

  it("renders an empty result without crashing", () => {
    expect(() =>
      renderToStaticMarkup(<TotalRevenueCard weeklyStats={[]} />),
    ).not.toThrow();
  });

  it("shows the full decline when revenue drops to zero", () => {
    const html = renderToStaticMarkup(
      <TotalRevenueCard
        weeklyStats={[
          dailyStat(1, "2026-11-09", 0),
          dailyStat(2, "2026-11-08", 100),
        ]}
      />,
    );

    expect(html).toContain("-100%");
    expect(html).toContain("lucide-arrow-down");
  });
});
