import { type Part } from "@wasp.sh/spec";

export function group<SomePart extends Part>(
  sharedState: Partial<SomePart>,
  parts: SomePart[],
) {
  return parts.map((part) => ({
    ...part,
    ...sharedState,
  }));
}
