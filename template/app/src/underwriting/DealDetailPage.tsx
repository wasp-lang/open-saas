import { ArrowRight, Building2, Calculator, FileText } from "lucide-react";
import { Link as ReactRouterLink, useParams } from "react-router";
import { getDealDetail, useQuery } from "wasp/client/operations";
import { Link as WaspRouterLink, routes } from "wasp/client/router";
import { Button } from "../client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../client/components/ui/card";

const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery(
    getDealDetail,
    { id: id ?? "" },
    { enabled: !!id },
  );

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Loading deal…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">
          Deal not found or you don't have access.
        </p>
        <div className="mt-4">
          <Button asChild variant="outline">
            <WaspRouterLink to={routes.DealsRoute.to}>
              Back to deals
            </WaspRouterLink>
          </Button>
        </div>
      </div>
    );
  }

  const { deal, underwritingRuns, loanScenarios, documentExtractions } = data;

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-muted-foreground text-sm">
              <WaspRouterLink
                to={routes.DealsRoute.to}
                className="hover:text-foreground"
              >
                Deals
              </WaspRouterLink>{" "}
              / {deal.name}
            </div>
            <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {deal.name}
            </h1>
            <div className="text-muted-foreground mt-1 text-sm">
              {[deal.address, deal.city, deal.state]
                .filter(Boolean)
                .join(", ") || "—"}{" "}
              • <span className="capitalize">{deal.assetClass}</span> •{" "}
              {currency(deal.purchasePrice)}
              {deal.units ? ` • ${deal.units} units` : ""}
              {deal.squareFeet
                ? ` • ${deal.squareFeet.toLocaleString()} sqft`
                : ""}
              {deal.yearBuilt ? ` • built ${deal.yearBuilt}` : ""}
            </div>
          </div>
          <div className="hidden gap-2 lg:flex">
            <Button asChild variant="outline">
              <ReactRouterLink to={`/underwriting?dealId=${deal.id}`}>
                <Calculator className="mr-2 h-4 w-4" />
                Underwrite
              </ReactRouterLink>
            </Button>
            <Button asChild variant="outline">
              <ReactRouterLink to={`/loan-sizing?dealId=${deal.id}`}>
                <Building2 className="mr-2 h-4 w-4" />
                Size debt
              </ReactRouterLink>
            </Button>
            <Button asChild variant="outline">
              <ReactRouterLink
                to={`/document-extract?dealId=${deal.id}`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Extract doc
              </ReactRouterLink>
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <SectionCard
            title="Underwriting runs"
            count={underwritingRuns.length}
            emptyHint="Run your first pro forma from this deal."
            ctaLabel="New pro forma"
            to={`/underwriting?dealId=${deal.id}`}
          >
            {underwritingRuns.map((r) => (
              <RunRow
                key={r.id}
                createdAt={r.createdAt}
                summary={r.summary}
              />
            ))}
          </SectionCard>

          <SectionCard
            title="Loan scenarios"
            count={loanScenarios.length}
            emptyHint="No debt scenarios yet for this deal."
            ctaLabel="New loan sizing"
            to={`/loan-sizing?dealId=${deal.id}`}
          >
            {loanScenarios.map((s) => (
              <RunRow
                key={s.id}
                createdAt={s.createdAt}
                summary={s.summary}
              />
            ))}
          </SectionCard>

          <SectionCard
            title="Document extractions"
            count={documentExtractions.length}
            emptyHint="No documents extracted yet for this deal."
            ctaLabel="Extract a doc"
            to={`/document-extract?dealId=${deal.id}`}
          >
            {documentExtractions.map((d) => (
              <RunRow
                key={d.id}
                createdAt={d.createdAt}
                summary={`${d.documentType} — ${d.sourceFileName}`}
              />
            ))}
          </SectionCard>
        </div>

        {deal.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm whitespace-pre-wrap">
              {deal.notes}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  count,
  emptyHint,
  ctaLabel,
  to,
  children,
}: {
  title: string;
  count: number;
  emptyHint: string;
  ctaLabel: string;
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">
          {title}
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            ({count})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {count === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyHint}</p>
        ) : (
          children
        )}
        <ReactRouterLink
          to={to}
          className="text-primary hover:text-primary/80 mt-3 inline-flex items-center text-sm font-medium"
        >
          {ctaLabel} <ArrowRight className="ml-1 h-4 w-4" />
        </ReactRouterLink>
      </CardContent>
    </Card>
  );
}

function RunRow({
  createdAt,
  summary,
}: {
  createdAt: Date;
  summary: string;
}) {
  return (
    <div className="border-border rounded-md border p-3 text-sm">
      <div className="text-muted-foreground text-xs">
        {new Date(createdAt).toLocaleString()}
      </div>
      <div className="text-foreground mt-1 line-clamp-3">{summary}</div>
    </div>
  );
}
