import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { getDeals, useQuery } from "wasp/client/operations";
import type { Deal } from "wasp/entities";
import { Label } from "../client/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../client/components/ui/select";

const NO_DEAL = "__no_deal__";

/**
 * Hook: keeps the caller's `dealId` state in sync with the `?dealId=` URL
 * search param. Returns the current dealId, a setter, and the list of deals.
 * Also fires `onDealSelected` when the selected deal changes so the page
 * can prefill its form.
 */
export function useDealSelection(
  onDealSelected?: (deal: Deal) => void,
): {
  deals: Deal[] | undefined;
  dealId: string | undefined;
  setDealId: (id: string | undefined) => void;
} {
  const { data: deals } = useQuery(getDeals);
  const [params, setParams] = useSearchParams();
  const dealId = params.get("dealId") ?? undefined;

  const setDealId = (id: string | undefined) => {
    const next = new URLSearchParams(params);
    if (id) next.set("dealId", id);
    else next.delete("dealId");
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (!dealId || !deals || !onDealSelected) return;
    const found = deals.find((d) => d.id === dealId);
    if (found) onDealSelected(found);
  }, [dealId, deals, onDealSelected]);

  return { deals, dealId, setDealId };
}

export function DealPicker({
  deals,
  dealId,
  onChange,
}: {
  deals: Deal[] | undefined;
  dealId: string | undefined;
  onChange: (id: string | undefined) => void;
}) {
  return (
    <div>
      <Label>Deal (optional)</Label>
      <Select
        value={dealId ?? NO_DEAL}
        onValueChange={(v) => onChange(v === NO_DEAL ? undefined : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Link to a saved deal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_DEAL}>— No deal —</SelectItem>
          {deals?.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
