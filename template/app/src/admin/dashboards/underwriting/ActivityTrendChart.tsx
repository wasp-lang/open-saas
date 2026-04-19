import { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../client/components/ui/card";
import type { UnderwritingActivityDay } from "../../../underwriting/operations";

const baseOptions: ApexOptions = {
  legend: { show: true, position: "top", horizontalAlign: "left" },
  colors: ["#3C50E0", "#80CAEE", "#FFAB00"],
  chart: {
    fontFamily: "system-ui, sans-serif",
    height: 280,
    type: "area",
    stacked: true,
    toolbar: { show: false },
  },
  stroke: { width: [2, 2, 2], curve: "smooth" },
  dataLabels: { enabled: false },
  grid: {
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    type: "category",
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
  },
  tooltip: { x: { format: "yyyy-MM-dd" } },
};

export default function ActivityTrendChart({
  trend,
}: {
  trend: UnderwritingActivityDay[];
}) {
  const { options, series } = useMemo(() => {
    const categories = trend.map((d) => d.date.slice(5)); // MM-DD
    const underwriting = trend.map((d) => d.underwritingRuns);
    const loan = trend.map((d) => d.loanScenarios);
    const extraction = trend.map((d) => d.documentExtractions);
    return {
      options: {
        ...baseOptions,
        xaxis: { ...baseOptions.xaxis, categories },
      },
      series: [
        { name: "Underwriting", data: underwriting },
        { name: "Loan sizing", data: loan },
        { name: "Doc extraction", data: extraction },
      ],
    };
  }, [trend]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Runs per day (last 30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={280}
        />
      </CardContent>
    </Card>
  );
}
