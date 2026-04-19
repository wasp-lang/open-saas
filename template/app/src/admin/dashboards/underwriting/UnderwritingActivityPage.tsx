import {
  Building2,
  Calculator,
  FileText,
  TrendingUp,
} from "lucide-react";
import { type AuthUser } from "wasp/auth";
import { getUnderwritingActivity, useQuery } from "wasp/client/operations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../client/components/ui/card";
import Breadcrumb from "../../layout/Breadcrumb";
import DefaultLayout from "../../layout/DefaultLayout";
import ActivityTrendChart from "./ActivityTrendChart";

const UnderwritingActivityPage = ({ user }: { user: AuthUser }) => {
  const {
    data: activity,
    isLoading,
    error,
  } = useQuery(getUnderwritingActivity);

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName="Underwriting Activity" />
      {error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive font-semibold">
              {error.message || "Failed to load activity"}
            </p>
          </CardContent>
        </Card>
      )}
      {isLoading && !activity && (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading activity…</p>
          </CardContent>
        </Card>
      )}
      {activity && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Calculator className="size-6" />}
              label="Underwriting runs"
              total={activity.totals.underwritingRuns}
              last7={activity.last7Days.underwritingRuns}
              last30={activity.last30Days.underwritingRuns}
            />
            <StatCard
              icon={<Building2 className="size-6" />}
              label="Loan scenarios"
              total={activity.totals.loanScenarios}
              last7={activity.last7Days.loanScenarios}
              last30={activity.last30Days.loanScenarios}
            />
            <StatCard
              icon={<FileText className="size-6" />}
              label="Document extractions"
              total={activity.totals.documentExtractions}
              last7={activity.last7Days.documentExtractions}
              last30={activity.last30Days.documentExtractions}
            />
            <StatCard
              icon={<TrendingUp className="size-6" />}
              label="Deals tracked"
              total={activity.totals.deals}
            />
          </div>

          <ActivityTrendChart trend={activity.trend} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top users (last 30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                {activity.topUsers.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No activity in the last 30 days yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-left">
                          <th className="py-2">User</th>
                          <th className="text-right">UW</th>
                          <th className="text-right">Loan</th>
                          <th className="text-right">Doc</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activity.topUsers.map((u) => (
                          <tr
                            key={u.userId}
                            className="border-border border-t"
                          >
                            <td className="py-2">
                              <div className="text-foreground font-medium">
                                {u.email ?? u.username ?? u.userId}
                              </div>
                              {u.email && u.username && (
                                <div className="text-muted-foreground text-xs">
                                  {u.username}
                                </div>
                              )}
                            </td>
                            <td className="text-right">
                              {u.underwritingRuns}
                            </td>
                            <td className="text-right">{u.loanScenarios}</td>
                            <td className="text-right">
                              {u.documentExtractions}
                            </td>
                            <td className="text-foreground text-right font-semibold">
                              {u.totalRuns}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activity.recent.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No activity yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {activity.recent.map((r) => (
                      <li
                        key={`${r.kind}-${r.id}`}
                        className="border-border rounded-md border p-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-primary text-xs font-semibold uppercase tracking-wide">
                            {kindLabel(r.kind)}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(r.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-foreground mt-1 line-clamp-2">
                          {r.summary}
                        </div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          {r.userEmail ?? r.userUsername ?? "unknown"}
                          {r.dealName ? ` • ${r.dealName}` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

function kindLabel(kind: "underwriting" | "loan" | "extraction"): string {
  switch (kind) {
    case "underwriting":
      return "Underwriting";
    case "loan":
      return "Loan sizing";
    case "extraction":
      return "Doc extraction";
  }
}

function StatCard({
  icon,
  label,
  total,
  last7,
  last30,
}: {
  icon: React.ReactNode;
  label: string;
  total: number;
  last7?: number;
  last30?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="bg-muted h-11.5 w-11.5 flex items-center justify-center rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <h4 className="text-title-md text-foreground font-bold">{total}</h4>
        <span className="text-muted-foreground text-sm font-medium">
          {label}
        </span>
        {(last7 !== undefined || last30 !== undefined) && (
          <div className="text-muted-foreground mt-3 flex gap-4 text-xs">
            {last7 !== undefined && <span>7d: {last7}</span>}
            {last30 !== undefined && <span>30d: {last30}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UnderwritingActivityPage;
