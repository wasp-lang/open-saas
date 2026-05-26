import { type Part } from "@wasp.sh/spec";

// You can create a separate file for TS spec helpers,
// as long as the file ends on `.wasp.ts`.

export function group<SomePart extends Part>(
  sharedState: Partial<SomePart>,
  parts: SomePart[],
) {
  return parts.map((part) => ({
    ...part,
    ...sharedState,
  }));
}
