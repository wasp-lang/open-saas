import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  createDeal,
  deleteDeal,
  getDeals,
  useQuery,
} from "wasp/client/operations";
import type { Deal } from "wasp/entities";
import { Button } from "../client/components/ui/button";
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
import { toast } from "../client/hooks/use-toast";
import type { AssetClass, DealInput } from "./schemas";

const assetClasses: AssetClass[] = [
  "multifamily",
  "office",
  "industrial",
  "retail",
  "hotel",
  "mixed-use",
];

const emptyDeal: DealInput = {
  name: "",
  address: "",
  city: "",
  state: "",
  assetClass: "multifamily",
  purchasePrice: 0,
  notes: "",
};

export default function DealsPage() {
  const { data: deals, isLoading } = useQuery(getDeals);
  const [form, setForm] = useState<DealInput>(emptyDeal);
  const [isSaving, setIsSaving] = useState(false);

  const update = <K extends keyof DealInput>(k: K, v: DealInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleCreate() {
    if (!form.name.trim()) return;
    try {
      setIsSaving(true);
      await createDeal(form);
      setForm(emptyDeal);
    } catch (err) {
      toast({
        title: "Could not save deal",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDeal({ id });
    } catch (err) {
      toast({
        title: "Could not delete deal",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Your <span className="text-primary">deals</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-7">
            Keep a simple registry of the properties you're underwriting. Link
            pro formas, loan scenarios, and extracted docs to each one.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add a deal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.currentTarget.value)}
                  placeholder="123 Main — Garden MF"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={form.address ?? ""}
                  onChange={(e) => update("address", e.currentTarget.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>City</Label>
                  <Input
                    value={form.city ?? ""}
                    onChange={(e) => update("city", e.currentTarget.value)}
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={form.state ?? ""}
                    onChange={(e) => update("state", e.currentTarget.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Asset class</Label>
                <Select
                  value={form.assetClass}
                  onValueChange={(v) => update("assetClass", v as AssetClass)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assetClasses.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Purchase price ($)</Label>
                <Input
                  type="number"
                  value={form.purchasePrice}
                  onChange={(e) =>
                    update(
                      "purchasePrice",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={isSaving || !form.name.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save deal"
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-3">
            {isLoading && (
              <div className="text-muted-foreground">Loading…</div>
            )}
            {!isLoading && deals && deals.length === 0 && (
              <Card className="bg-muted/30">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No deals yet — add your first one on the left.
                  </p>
                </CardContent>
              </Card>
            )}
            {deals?.map((d: Deal) => (
              <Card key={d.id}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <div className="text-foreground font-semibold">
                      {d.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {[d.address, d.city, d.state]
                        .filter(Boolean)
                        .join(", ") || "—"}{" "}
                      • {d.assetClass} •{" "}
                      {d.purchasePrice.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(d.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
