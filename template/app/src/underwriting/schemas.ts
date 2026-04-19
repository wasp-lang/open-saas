import * as z from "zod";

export const assetClassSchema = z.enum([
  "multifamily",
  "office",
  "industrial",
  "retail",
  "hotel",
  "mixed-use",
]);
export type AssetClass = z.infer<typeof assetClassSchema>;

// ---------- Deal ----------
export const dealInputSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  assetClass: assetClassSchema,
  units: z.number().int().nonnegative().optional(),
  squareFeet: z.number().int().nonnegative().optional(),
  yearBuilt: z.number().int().optional(),
  purchasePrice: z.number().positive(),
  notes: z.string().optional().default(""),
});
export type DealInput = z.infer<typeof dealInputSchema>;

// ---------- Underwriting ----------
export const underwritingInputSchema = z.object({
  dealId: z.string().optional(),
  purchasePrice: z.number().positive(),
  year1Noi: z.number().positive(),
  rentGrowthPct: z.number(), // e.g. 3 = 3%
  expenseGrowthPct: z.number(),
  vacancyPct: z.number(), // reserve (reduces effective revenue)
  exitCapRatePct: z.number().positive(),
  holdPeriodYears: z.number().int().positive().max(20),
  ltvPct: z.number().min(0).max(95),
  interestRatePct: z.number().positive(),
  amortYears: z.number().int().positive(),
  interestOnlyYears: z.number().int().min(0).max(10).default(0),
  assetClass: assetClassSchema,
  market: z.string().optional().default(""),
});
export type UnderwritingInput = z.infer<typeof underwritingInputSchema>;

export const cashFlowYearSchema = z.object({
  year: z.number().int(),
  noi: z.number(),
  debtService: z.number(),
  cashFlow: z.number(),
  cashOnCashPct: z.number(),
});

export const underwritingOutputSchema = z.object({
  loanAmount: z.number(),
  equityRequired: z.number(),
  year1DSCR: z.number(),
  year1CashOnCashPct: z.number(),
  leveredIRRPct: z.number(),
  unleveredIRRPct: z.number(),
  equityMultiple: z.number(),
  saleProceeds: z.number(),
  exitValue: z.number(),
  cashFlows: cashFlowYearSchema.array(),
  sensitivity: z
    .object({
      exitCapRatePct: z.number(),
      rentGrowthPct: z.number(),
      leveredIRRPct: z.number(),
    })
    .array(),
});
export type UnderwritingOutput = z.infer<typeof underwritingOutputSchema>;

export const underwritingNarrativeSchema = z.object({
  executiveSummary: z
    .string()
    .describe("2-3 sentence top-line summary for an investment committee"),
  strengths: z.string().array().describe("Bullet list, 3-5 items"),
  risks: z.string().array().describe("Bullet list, 3-5 items"),
  recommendation: z
    .enum(["proceed", "proceed_with_conditions", "pass"])
    .describe("Final recommendation"),
  recommendationRationale: z.string(),
});
export type UnderwritingNarrative = z.infer<typeof underwritingNarrativeSchema>;

// ---------- Loan Sizing ----------
export const loanSizingInputSchema = z.object({
  dealId: z.string().optional(),
  purchasePrice: z.number().positive(),
  stabilizedNoi: z.number().positive(),
  interestRatePct: z.number().positive(),
  amortYears: z.number().int().positive(),
  termYears: z.number().int().positive(),
  interestOnlyYears: z.number().int().min(0).max(10).default(0),
  dscrTarget: z.number().positive(), // e.g. 1.25
  maxLtvPct: z.number().min(1).max(95),
  minDebtYieldPct: z.number().positive(), // e.g. 8
  assetClass: assetClassSchema,
});
export type LoanSizingInput = z.infer<typeof loanSizingInputSchema>;

export const loanSizingOutputSchema = z.object({
  maxLoanByLtv: z.number(),
  maxLoanByDscr: z.number(),
  maxLoanByDebtYield: z.number(),
  recommendedLoan: z.number(),
  bindingConstraint: z.enum(["LTV", "DSCR", "DebtYield"]),
  annualDebtService: z.number(),
  monthlyPayment: z.number(),
  resultingLtvPct: z.number(),
  resultingDscr: z.number(),
  resultingDebtYieldPct: z.number(),
});
export type LoanSizingOutput = z.infer<typeof loanSizingOutputSchema>;

export const loanMemoSchema = z.object({
  summary: z.string().describe("2-3 sentence debt overview"),
  riskFactors: z.string().array(),
  lenderFit: z
    .object({
      lenderType: z.enum([
        "agency",
        "bank",
        "life-co",
        "cmbs",
        "debt-fund",
      ]),
      rationale: z.string(),
    })
    .array()
    .describe("Recommended lender types ranked best-fit first"),
});
export type LoanMemo = z.infer<typeof loanMemoSchema>;

// ---------- Document Extraction ----------
export const extractionDocTypeSchema = z.enum([
  "t12",
  "rent_roll",
  "om",
  "loan_quote",
]);
export type ExtractionDocType = z.infer<typeof extractionDocTypeSchema>;

export const extractionInputSchema = z.object({
  dealId: z.string().optional(),
  documentType: extractionDocTypeSchema,
  sourceFileName: z.string().min(1),
  rawText: z.string().min(20),
});
export type ExtractionInput = z.infer<typeof extractionInputSchema>;

export const rentRollRowSchema = z.object({
  unit: z.string(),
  unitType: z.string().optional().default(""),
  sqft: z.number().optional(),
  tenantName: z.string().optional().default(""),
  monthlyRent: z.number(),
  leaseStart: z.string().optional().default(""),
  leaseEnd: z.string().optional().default(""),
  isOccupied: z.boolean(),
});

export const rentRollExtractionSchema = z.object({
  kind: z.literal("rent_roll"),
  asOfDate: z.string().optional().default(""),
  totalUnits: z.number().int(),
  occupiedUnits: z.number().int(),
  totalMonthlyRent: z.number(),
  rows: rentRollRowSchema.array(),
  notes: z.string().optional().default(""),
});

export const t12LineSchema = z.object({
  category: z.enum(["income", "expense"]),
  name: z.string(),
  annualAmount: z.number(),
});

export const t12ExtractionSchema = z.object({
  kind: z.literal("t12"),
  periodStart: z.string().optional().default(""),
  periodEnd: z.string().optional().default(""),
  totalIncome: z.number(),
  totalExpenses: z.number(),
  noi: z.number(),
  lines: t12LineSchema.array(),
  notes: z.string().optional().default(""),
});

export const omExtractionSchema = z.object({
  kind: z.literal("om"),
  propertyName: z.string(),
  askingPrice: z.number().optional(),
  units: z.number().int().optional(),
  squareFeet: z.number().int().optional(),
  yearBuilt: z.number().int().optional(),
  t12Noi: z.number().optional(),
  year1ProjectedNoi: z.number().optional(),
  highlights: z.string().array(),
});

export const loanQuoteExtractionSchema = z.object({
  kind: z.literal("loan_quote"),
  lender: z.string(),
  loanAmount: z.number().optional(),
  ltvPct: z.number().optional(),
  interestRatePct: z.number().optional(),
  termYears: z.number().optional(),
  amortYears: z.number().optional(),
  interestOnlyYears: z.number().optional(),
  recourse: z.enum(["full", "partial", "non-recourse"]).optional(),
  keyTerms: z.string().array(),
});

export const extractionOutputSchema = z.discriminatedUnion("kind", [
  rentRollExtractionSchema,
  t12ExtractionSchema,
  omExtractionSchema,
  loanQuoteExtractionSchema,
]);
export type ExtractionOutput = z.infer<typeof extractionOutputSchema>;
