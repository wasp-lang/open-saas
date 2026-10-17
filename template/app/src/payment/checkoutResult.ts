// Kept apart from `CheckoutResultPage.tsx` so that server code (`paths.ts`)
// can use it without importing client-only modules.
export enum CheckoutResult {
  Success = "success",
  Canceled = "canceled",
}
