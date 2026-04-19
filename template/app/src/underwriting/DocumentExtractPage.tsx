import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { extractDocument } from "wasp/client/operations";
import { Link, routes } from "wasp/client/router";
import { Button } from "../client/components/ui/button";
import { DealPicker, useDealSelection } from "./DealPicker";
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
import { Textarea } from "../client/components/ui/textarea";
import { ToastAction } from "../client/components/ui/toast";
import { toast } from "../client/hooks/use-toast";
import type { ExtractionResult } from "./operations";
import type { ExtractionDocType, ExtractionOutput } from "./schemas";

const docTypeOptions: { value: ExtractionDocType; label: string }[] = [
  { value: "t12", label: "T-12 operating statement" },
  { value: "rent_roll", label: "Rent roll" },
  { value: "om", label: "Offering memorandum (OM)" },
  { value: "loan_quote", label: "Loan quote / term sheet" },
];

export default function DocumentExtractPage() {
  const [docType, setDocType] = useState<ExtractionDocType>("t12");
  const [sourceFileName, setSourceFileName] = useState("pasted.txt");
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { deals, dealId, setDealId } = useDealSelection();

  async function handleRun() {
    if (rawText.trim().length < 20) {
      toast({
        title: "Not enough text",
        description:
          "Paste at least a few lines of the document for extraction.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsRunning(true);
      const res = await extractDocument({
        documentType: docType,
        sourceFileName,
        rawText,
        dealId,
      });
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
          title: "Extraction failed",
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
            Document <span className="text-primary">Extraction</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-7">
            Paste the text of a rent roll, T-12, OM, or loan quote. Get back
            structured data you can drop straight into your underwriting. 1
            credit per document.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DealPicker
                deals={deals}
                dealId={dealId}
                onChange={setDealId}
              />
              <div>
                <Label>Document type</Label>
                <Select
                  value={docType}
                  onValueChange={(v) => setDocType(v as ExtractionDocType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {docTypeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Source file name</Label>
                <Input
                  value={sourceFileName}
                  onChange={(e) => setSourceFileName(e.currentTarget.value)}
                  placeholder="e.g. 123-main-rent-roll.pdf"
                />
              </div>
              <div>
                <Label>Paste document text</Label>
                <Textarea
                  rows={14}
                  value={rawText}
                  onChange={(e) => setRawText(e.currentTarget.value)}
                  placeholder="Paste the text from the rent roll, T-12, OM, or loan term sheet here..."
                />
              </div>
              <Button
                className="w-full"
                onClick={handleRun}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting…
                  </>
                ) : (
                  "Extract (1 credit)"
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {result ? (
              <ExtractionResultView extracted={result.extracted} />
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="py-16 text-center">
                  <p className="text-muted-foreground">
                    Pick a document type and paste the text. Structured output
                    will show up here.
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

function ExtractionResultView({ extracted }: { extracted: ExtractionOutput }) {
  if (extracted.kind === "t12") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>T-12 extraction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-3">
            <Metric
              label="Total income"
              value={currency(extracted.totalIncome)}
            />
            <Metric
              label="Total expenses"
              value={currency(extracted.totalExpenses)}
            />
            <Metric label="NOI" value={currency(extracted.noi)} />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-left">
                <th className="py-2">Category</th>
                <th>Line</th>
                <th className="text-right">Annual</th>
              </tr>
            </thead>
            <tbody>
              {extracted.lines.map((l, i) => (
                <tr key={i} className="border-border border-t">
                  <td className="py-2 capitalize">{l.category}</td>
                  <td>{l.name}</td>
                  <td className="text-right">{currency(l.annualAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  }

  if (extracted.kind === "rent_roll") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rent roll extraction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-3">
            <Metric
              label="Total units"
              value={String(extracted.totalUnits)}
            />
            <Metric
              label="Occupied"
              value={String(extracted.occupiedUnits)}
            />
            <Metric
              label="Monthly rent"
              value={currency(extracted.totalMonthlyRent)}
            />
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground bg-background sticky top-0 text-left">
                  <th className="py-2">Unit</th>
                  <th>Type</th>
                  <th>Tenant</th>
                  <th className="text-right">Rent</th>
                  <th>Occ</th>
                </tr>
              </thead>
              <tbody>
                {extracted.rows.map((r, i) => (
                  <tr key={i} className="border-border border-t">
                    <td className="py-2">{r.unit}</td>
                    <td>{r.unitType}</td>
                    <td>{r.tenantName || "—"}</td>
                    <td className="text-right">{currency(r.monthlyRent)}</td>
                    <td>{r.isOccupied ? "Y" : "N"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (extracted.kind === "om") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OM extraction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <h3 className="text-foreground text-lg font-semibold">
            {extracted.propertyName}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {extracted.askingPrice !== undefined && (
              <Metric
                label="Asking"
                value={currency(extracted.askingPrice)}
              />
            )}
            {extracted.units !== undefined && (
              <Metric label="Units" value={String(extracted.units)} />
            )}
            {extracted.squareFeet !== undefined && (
              <Metric
                label="Sq ft"
                value={extracted.squareFeet.toLocaleString()}
              />
            )}
            {extracted.yearBuilt !== undefined && (
              <Metric label="Year built" value={String(extracted.yearBuilt)} />
            )}
            {extracted.t12Noi !== undefined && (
              <Metric label="T-12 NOI" value={currency(extracted.t12Noi)} />
            )}
            {extracted.year1ProjectedNoi !== undefined && (
              <Metric
                label="Y1 proj NOI"
                value={currency(extracted.year1ProjectedNoi)}
              />
            )}
          </div>
          {extracted.highlights.length > 0 && (
            <ul className="text-muted-foreground list-disc pl-5">
              {extracted.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  }

  // loan_quote
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan quote extraction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <h3 className="text-foreground text-lg font-semibold">
          {extracted.lender}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {extracted.loanAmount !== undefined && (
            <Metric label="Loan" value={currency(extracted.loanAmount)} />
          )}
          {extracted.ltvPct !== undefined && (
            <Metric label="LTV" value={`${extracted.ltvPct}%`} />
          )}
          {extracted.interestRatePct !== undefined && (
            <Metric label="Rate" value={`${extracted.interestRatePct}%`} />
          )}
          {extracted.termYears !== undefined && (
            <Metric label="Term" value={`${extracted.termYears} yrs`} />
          )}
          {extracted.amortYears !== undefined && (
            <Metric label="Amort" value={`${extracted.amortYears} yrs`} />
          )}
          {extracted.interestOnlyYears !== undefined && (
            <Metric label="I/O" value={`${extracted.interestOnlyYears} yrs`} />
          )}
          {extracted.recourse && (
            <Metric label="Recourse" value={extracted.recourse} />
          )}
        </div>
        {extracted.keyTerms.length > 0 && (
          <ul className="text-muted-foreground list-disc pl-5">
            {extracted.keyTerms.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-md p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-foreground mt-1 text-base font-semibold">
        {value}
      </div>
    </div>
  );
}
