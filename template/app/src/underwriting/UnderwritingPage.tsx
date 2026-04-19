import { ArrowRight, Download, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  exportUnderwritingRun,
  runUnderwriting,
} from "wasp/client/operations";
import { Link, routes } from "wasp/client/router";
import type { Deal } from "wasp/entities";
import { Button } from "../client/components/ui/button";
import { DealPicker, useDealSelection } from "./DealPicker";
import { downloadXlsx } from "./downloadXlsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../client/components/ui/card";
import { Input } from "../client/components/ui/input";
import { Label } from "../client/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../client/components/ui/select";
import { ToastAction } from "../client/components/ui/toast";
import { toast } from "../client/hooks/use-toast";
import type { UnderwritingRunResult } from "./operations";
import type { AssetClass, UnderwritingInput } from "./schemas";

const defaults: UnderwritingInput = {
  purchasePrice: 10_000_000,
  year1Noi: 600_000,
  rentGrowthPct: 3,
  expenseGrowthPct: 2.5,
  vacancyPct: 5,
  exitCapRatePct: 6.0,
  holdPeriodYears: 5,
  ltvPct: 65,
  interestRatePct: 6.5,
  amortYears: 30,
  interestOnlyYears: 2,
  assetClass: "multifamily",
  market: "",
};

const assetClassOptions: AssetClass[] = [
  "multifamily",
  "office",
  "industrial",
  "retail",
  "hotel",
  "mixed-use",
];

const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const pct = (n: number) => `${n.toFixed(2)}%`;

export default function UnderwritingPage() {
  const [form, setForm] = useState<UnderwritingInput>(defaults);
  const [result, setResult] = useState<UnderwritingRunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedDealRef = useRef<Deal | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const prefillFromDeal = useCallback((deal: Deal) => {
    selectedDealRef.current = deal;
    setForm((f) => ({
      ...f,
      purchasePrice: deal.purchasePrice,
      assetClass: deal.assetClass as UnderwritingInput["assetClass"],
      market: [deal.city, deal.state].filter(Boolean).join(", "),
    }));
  }, []);

  const { deals, dealId, setDealId } = useDealSelection(prefillFromDeal);

  async function handleExport() {
    if (!result) return;
    try {
      setIsExporting(true);
      const res = await exportUnderwritingRun({
        dealName: selectedDealRef.current?.name ?? null,
        input: form,
        output: result.output,
        narrative: result.narrative,
      });
      downloadXlsx(res.filename, res.base64);
    } catch (err) {
      toast({
        title: "Export failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }

  const update = <K extends keyof UnderwritingInput>(
    key: K,
    value: UnderwritingInput[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  async function handleRun() {
    try {
      setIsRunning(true);
      const res = await runUnderwriting({ ...form, dealId });
      setResult(res);
    } catch (err) {
      const statusCode =
        err && typeof err === "object" && "statusCode" in err
          ? err.statusCode
          : undefined;
      if (statusCode === 402) {
        toast({
          title: "You're out of credits",
          action: (
            <ToastAction altText="Go to pricing" asChild>
              <Link to={routes.PricingPageRoute.to}>
                Pricing <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </ToastAction>
          ),
        });
      } else {
        toast({
          title: "Underwriting failed",
          description:
            err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      }
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Underwriting <span className="text-primary">Pro Forma</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-7">
            Enter deal inputs, get a full 10-year levered cash flow, IRR,
            equity multiple, sensitivity table, and an analyst-style memo. 1
            credit per run.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Deal inputs</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <DealPicker
                  deals={deals}
                  dealId={dealId}
                  onChange={setDealId}
                />
              </div>
              <div className="col-span-2">
                <Label>Asset class</Label>
                <Select
                  value={form.assetClass}
                  onValueChange={(v) => update("assetClass", v as AssetClass)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assetClassOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <NumberField
                label="Purchase price ($)"
                value={form.purchasePrice}
                onChange={(v) => update("purchasePrice", v)}
              />
              <NumberField
                label="Year 1 NOI ($)"
                value={form.year1Noi}
                onChange={(v) => update("year1Noi", v)}
              />
              <NumberField
                label="Rent growth (%)"
                value={form.rentGrowthPct}
                onChange={(v) => update("rentGrowthPct", v)}
                step={0.25}
              />
              <NumberField
                label="Expense growth (%)"
                value={form.expenseGrowthPct}
                onChange={(v) => update("expenseGrowthPct", v)}
                step={0.25}
              />
              <NumberField
                label="Vacancy (%)"
                value={form.vacancyPct}
                onChange={(v) => update("vacancyPct", v)}
                step={0.5}
              />
              <NumberField
                label="Exit cap rate (%)"
                value={form.exitCapRatePct}
                onChange={(v) => update("exitCapRatePct", v)}
                step={0.25}
              />
              <NumberField
                label="Hold period (yrs)"
                value={form.holdPeriodYears}
                onChange={(v) => update("holdPeriodYears", v)}
                step={1}
              />
              <NumberField
                label="LTV (%)"
                value={form.ltvPct}
                onChange={(v) => update("ltvPct", v)}
                step={1}
              />
              <NumberField
                label="Interest rate (%)"
                value={form.interestRatePct}
                onChange={(v) => update("interestRatePct", v)}
                step={0.125}
              />
              <NumberField
                label="Amort (yrs)"
                value={form.amortYears}
                onChange={(v) => update("amortYears", v)}
                step={1}
              />
              <NumberField
                label="Interest-only (yrs)"
                value={form.interestOnlyYears}
                onChange={(v) => update("interestOnlyYears", v)}
                step={1}
              />
              <div className="col-span-2">
                <Label>Market (optional)</Label>
                <Input
                  value={form.market ?? ""}
                  onChange={(e) => update("market", e.target.value)}
                  placeholder="e.g. Phoenix, AZ submarket"
                />
              </div>
              <div className="col-span-2">
                <Button
                  className="w-full"
                  onClick={handleRun}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running analysis…
                    </>
                  ) : (
                    "Run underwriting (1 credit)"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {result ? (
              <>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Building Excel…
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export to Excel
                      </>
                    )}
                  </Button>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Key metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <Metric
                      label="Levered IRR"
                      value={pct(result.output.leveredIRRPct)}
                    />
                    <Metric
                      label="Unlevered IRR"
                      value={pct(result.output.unleveredIRRPct)}
                    />
                    <Metric
                      label="Equity multiple"
                      value={`${result.output.equityMultiple.toFixed(2)}x`}
                    />
                    <Metric
                      label="Year 1 DSCR"
                      value={result.output.year1DSCR.toFixed(2)}
                    />
                    <Metric
                      label="Year 1 cash-on-cash"
                      value={pct(result.output.year1CashOnCashPct)}
                    />
                    <Metric
                      label="Exit value"
                      value={currency(result.output.exitValue)}
                    />
                    <Metric
                      label="Loan amount"
                      value={currency(result.output.loanAmount)}
                    />
                    <Metric
                      label="Equity required"
                      value={currency(result.output.equityRequired)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Analyst memo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <RecommendationBadge
                      recommendation={result.narrative.recommendation}
                    />
                    <p className="text-foreground">
                      {result.narrative.executiveSummary}
                    </p>
                    <div>
                      <h4 className="text-foreground font-semibold">
                        Strengths
                      </h4>
                      <ul className="text-muted-foreground mt-1 list-disc pl-5">
                        {result.narrative.strengths.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-foreground font-semibold">Risks</h4>
                      <ul className="text-muted-foreground mt-1 list-disc pl-5">
                        {result.narrative.risks.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-muted-foreground italic">
                      {result.narrative.recommendationRationale}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cash flow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground text-left">
                            <th className="py-2">Yr</th>
                            <th>NOI</th>
                            <th>Debt svc</th>
                            <th>Cash flow</th>
                            <th>CoC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.output.cashFlows.map((cf) => (
                            <tr
                              key={cf.year}
                              className="border-border border-t"
                            >
                              <td className="py-2">{cf.year}</td>
                              <td>{currency(cf.noi)}</td>
                              <td>{currency(cf.debtService)}</td>
                              <td>{currency(cf.cashFlow)}</td>
                              <td>{pct(cf.cashOnCashPct)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Levered IRR sensitivity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground text-left">
                            <th className="py-2">Exit cap</th>
                            <th>Rent growth</th>
                            <th>Levered IRR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.output.sensitivity.map((s, i) => (
                            <tr
                              key={i}
                              className="border-border border-t"
                            >
                              <td className="py-2">
                                {pct(s.exitCapRatePct)}
                              </td>
                              <td>{pct(s.rentGrowthPct)}</td>
                              <td>{pct(s.leveredIRRPct)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="py-16 text-center">
                  <p className="text-muted-foreground">
                    Enter deal assumptions, then run underwriting to see your
                    pro forma.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.currentTarget.value) || 0)}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-md p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-foreground mt-1 text-lg font-semibold">
        {value}
      </div>
    </div>
  );
}

function RecommendationBadge({
  recommendation,
}: {
  recommendation: "proceed" | "proceed_with_conditions" | "pass";
}) {
  const map = {
    proceed: { label: "Proceed", cls: "bg-success/20 text-success" },
    proceed_with_conditions: {
      label: "Proceed with conditions",
      cls: "bg-warning/20 text-warning",
    },
    pass: {
      label: "Pass",
      cls: "bg-destructive/20 text-destructive",
    },
  };
  const { label, cls } = map[recommendation];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}
