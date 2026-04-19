import { ArrowRight, Download, Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  exportLoanScenario,
  runLoanSizing,
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
import type { LoanSizingResult } from "./operations";
import type { AssetClass, LoanSizingInput } from "./schemas";

const defaults: LoanSizingInput = {
  purchasePrice: 10_000_000,
  stabilizedNoi: 650_000,
  interestRatePct: 6.5,
  amortYears: 30,
  termYears: 10,
  interestOnlyYears: 2,
  dscrTarget: 1.25,
  maxLtvPct: 70,
  minDebtYieldPct: 8,
  assetClass: "multifamily",
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

export default function LoanSizingPage() {
  const [form, setForm] = useState<LoanSizingInput>(defaults);
  const [result, setResult] = useState<LoanSizingResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedDealRef = useRef<Deal | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const prefillFromDeal = useCallback((deal: Deal) => {
    selectedDealRef.current = deal;
    setForm((f) => ({
      ...f,
      purchasePrice: deal.purchasePrice,
      assetClass: deal.assetClass as LoanSizingInput["assetClass"],
    }));
  }, []);

  const { deals, dealId, setDealId } = useDealSelection(prefillFromDeal);

  async function handleExport() {
    if (!result) return;
    try {
      setIsExporting(true);
      const res = await exportLoanScenario({
        dealName: selectedDealRef.current?.name ?? null,
        input: form,
        output: result.output,
        memo: result.memo,
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

  const update = <K extends keyof LoanSizingInput>(
    k: K,
    v: LoanSizingInput[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  async function handleRun() {
    try {
      setIsRunning(true);
      const res = await runLoanSizing({ ...form, dealId });
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
          title: "Loan sizing failed",
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
            Loan Sizing & <span className="text-primary">Debt Analysis</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-7">
            Find max proceeds across LTV, DSCR, and debt-yield constraints.
            Get a debt memo with ranked lender fit. 1 credit per run.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sizing inputs</CardTitle>
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
                label="Stabilized NOI ($)"
                value={form.stabilizedNoi}
                onChange={(v) => update("stabilizedNoi", v)}
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
              />
              <NumberField
                label="Term (yrs)"
                value={form.termYears}
                onChange={(v) => update("termYears", v)}
              />
              <NumberField
                label="Interest-only (yrs)"
                value={form.interestOnlyYears}
                onChange={(v) => update("interestOnlyYears", v)}
              />
              <NumberField
                label="DSCR target"
                value={form.dscrTarget}
                onChange={(v) => update("dscrTarget", v)}
                step={0.05}
              />
              <NumberField
                label="Max LTV (%)"
                value={form.maxLtvPct}
                onChange={(v) => update("maxLtvPct", v)}
                step={1}
              />
              <NumberField
                label="Min debt yield (%)"
                value={form.minDebtYieldPct}
                onChange={(v) => update("minDebtYieldPct", v)}
                step={0.25}
              />
              <div className="col-span-2">
                <Button
                  className="w-full"
                  onClick={handleRun}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sizing…
                    </>
                  ) : (
                    "Size the loan (1 credit)"
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
                    <CardTitle>Max loan by constraint</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-3 text-sm">
                    <Metric
                      label="LTV"
                      value={currency(result.output.maxLoanByLtv)}
                      bound={result.output.bindingConstraint === "LTV"}
                    />
                    <Metric
                      label="DSCR"
                      value={currency(result.output.maxLoanByDscr)}
                      bound={result.output.bindingConstraint === "DSCR"}
                    />
                    <Metric
                      label="Debt yield"
                      value={currency(result.output.maxLoanByDebtYield)}
                      bound={
                        result.output.bindingConstraint === "DebtYield"
                      }
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommended loan</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <Metric
                      label="Loan amount"
                      value={currency(result.output.recommendedLoan)}
                    />
                    <Metric
                      label="Binding constraint"
                      value={result.output.bindingConstraint}
                    />
                    <Metric
                      label="LTV"
                      value={pct(result.output.resultingLtvPct)}
                    />
                    <Metric
                      label="DSCR"
                      value={result.output.resultingDscr.toFixed(2)}
                    />
                    <Metric
                      label="Debt yield"
                      value={pct(result.output.resultingDebtYieldPct)}
                    />
                    <Metric
                      label="Annual debt service"
                      value={currency(result.output.annualDebtService)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Debt memo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p className="text-foreground">{result.memo.summary}</p>
                    {result.memo.riskFactors.length > 0 && (
                      <div>
                        <h4 className="text-foreground font-semibold">
                          Risk factors
                        </h4>
                        <ul className="text-muted-foreground mt-1 list-disc pl-5">
                          {result.memo.riskFactors.map((r) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <h4 className="text-foreground font-semibold">
                        Lender fit (best first)
                      </h4>
                      <ul className="text-muted-foreground mt-1 space-y-2">
                        {result.memo.lenderFit.map((l) => (
                          <li
                            key={l.lenderType}
                            className="border-border rounded-md border p-2"
                          >
                            <div className="text-foreground font-medium">
                              {l.lenderType}
                            </div>
                            <div className="text-xs">{l.rationale}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="py-16 text-center">
                  <p className="text-muted-foreground">
                    Configure sizing assumptions and run to see max proceeds,
                    resulting metrics, and a debt memo.
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

function Metric({
  label,
  value,
  bound,
}: {
  label: string;
  value: string;
  bound?: boolean;
}) {
  return (
    <div
      className={`rounded-md p-3 ${
        bound ? "bg-primary/10 ring-primary ring-1" : "bg-muted/30"
      }`}
    >
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-foreground mt-1 text-lg font-semibold">
        {value}
      </div>
    </div>
  );
}
