import type { PrismaPromise } from "@prisma/client";
import OpenAI from "openai";
import type {
  Deal,
  DocumentExtraction,
  LoanScenario,
  UnderwritingRun,
  User,
} from "wasp/entities";
import { env, HttpError, prisma } from "wasp/server";
import type {
  CreateDeal,
  DeleteDeal,
  ExtractDocument,
  GetDeal,
  GetDealDetail,
  GetDeals,
  GetDocumentExtractions,
  GetLoanScenarios,
  GetUnderwritingActivity,
  GetUnderwritingRuns,
  RunLoanSizing,
  RunUnderwriting,
} from "wasp/server/operations";
import * as z from "zod";
import { SubscriptionStatus } from "../payment/plans";
import { ensureArgsSchemaOrThrowHttpError } from "../server/validation";
import { computeLoanSizing, computeUnderwriting } from "./finance";
import {
  dealInputSchema,
  extractionInputSchema,
  extractionOutputSchema,
  loanMemoSchema,
  loanSizingInputSchema,
  type LoanSizingOutput,
  type ExtractionOutput,
  type LoanMemo,
  underwritingInputSchema,
  underwritingNarrativeSchema,
  type UnderwritingNarrative,
  type UnderwritingOutput,
} from "./schemas";

const openAi = new OpenAI({ apiKey: env.OPENAI_API_KEY });

// ---------- Helpers ----------
function requireAuth(
  ctx: { user?: User },
): asserts ctx is { user: User } {
  if (!ctx.user) {
    throw new HttpError(401, "Authentication required");
  }
}

function isUserSubscribed(user: User): boolean {
  return (
    user.subscriptionStatus === SubscriptionStatus.Active ||
    user.subscriptionStatus === SubscriptionStatus.CancelAtPeriodEnd
  );
}

/**
 * Returns a Prisma promise that decrements the caller's credit balance by 1.
 * Throws 402 up-front when the user has no remaining credits so the operation
 * fails before any AI work runs.
 */
function buildCreditDecrement(
  user: User,
  ctx: { entities: { User: typeof prisma.user } },
): PrismaPromise<User> {
  if (user.credits <= 0) {
    const msg = isUserSubscribed(user)
      ? "Monthly credit allotment exhausted. Buy a top-up pack to keep going."
      : "Out of credits. Subscribe or buy a credit pack to continue.";
    throw new HttpError(402, msg);
  }
  return ctx.entities.User.update({
    where: { id: user.id },
    data: { credits: { decrement: 1 } },
  });
}

// ---------- Deal CRUD ----------
export const createDeal: CreateDeal<
  z.infer<typeof dealInputSchema>,
  Deal
> = async (rawArgs, context) => {
  requireAuth(context);
  const args = ensureArgsSchemaOrThrowHttpError(dealInputSchema, rawArgs);
  return context.entities.Deal.create({
    data: {
      ...args,
      user: { connect: { id: context.user.id } },
    },
  });
};

export const deleteDeal: DeleteDeal<{ id: string }, { id: string }> = async (
  rawArgs,
  context,
) => {
  requireAuth(context);
  const { id } = ensureArgsSchemaOrThrowHttpError(
    z.object({ id: z.string().min(1) }),
    rawArgs,
  );
  await context.entities.Deal.delete({
    where: { id, user: { id: context.user.id } },
  });
  return { id };
};

export const getDeals: GetDeals<void, Deal[]> = async (_a, context) => {
  requireAuth(context);
  return context.entities.Deal.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: "desc" },
  });
};

export const getDeal: GetDeal<{ id: string }, Deal | null> = async (
  rawArgs,
  context,
) => {
  requireAuth(context);
  const { id } = ensureArgsSchemaOrThrowHttpError(
    z.object({ id: z.string().min(1) }),
    rawArgs,
  );
  return context.entities.Deal.findFirst({
    where: { id, userId: context.user.id },
  });
};

export type DealDetail = {
  deal: Deal;
  underwritingRuns: UnderwritingRun[];
  loanScenarios: LoanScenario[];
  documentExtractions: DocumentExtraction[];
};

export const getDealDetail: GetDealDetail<
  { id: string },
  DealDetail | null
> = async (rawArgs, context) => {
  requireAuth(context);
  const { id } = ensureArgsSchemaOrThrowHttpError(
    z.object({ id: z.string().min(1) }),
    rawArgs,
  );
  const deal = await context.entities.Deal.findFirst({
    where: { id, userId: context.user.id },
  });
  if (!deal) return null;

  const [underwritingRuns, loanScenarios, documentExtractions] =
    await Promise.all([
      context.entities.UnderwritingRun.findMany({
        where: { dealId: id, userId: context.user.id },
        orderBy: { createdAt: "desc" },
      }),
      context.entities.LoanScenario.findMany({
        where: { dealId: id, userId: context.user.id },
        orderBy: { createdAt: "desc" },
      }),
      context.entities.DocumentExtraction.findMany({
        where: { dealId: id, userId: context.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return { deal, underwritingRuns, loanScenarios, documentExtractions };
};

// ---------- Underwriting ----------
export type UnderwritingRunResult = {
  id: string;
  output: UnderwritingOutput;
  narrative: UnderwritingNarrative;
};

export const runUnderwriting: RunUnderwriting<
  z.infer<typeof underwritingInputSchema>,
  UnderwritingRunResult
> = async (rawArgs, context) => {
  requireAuth(context);
  const input = ensureArgsSchemaOrThrowHttpError(
    underwritingInputSchema,
    rawArgs,
  );

  const output = computeUnderwriting(input);
  const narrative = await generateUnderwritingNarrative(input, output);

  const create = context.entities.UnderwritingRun.create({
    data: {
      user: { connect: { id: context.user.id } },
      ...(input.dealId
        ? { deal: { connect: { id: input.dealId } } }
        : {}),
      inputs: JSON.stringify(input),
      outputs: JSON.stringify(output),
      summary: narrative.executiveSummary,
    },
  });

  const decrement = buildCreditDecrement(context.user, context);
  const [run] = await prisma.$transaction([create, decrement]);

  return {
    id: (run as UnderwritingRun).id,
    output,
    narrative,
  };
};

export const getUnderwritingRuns: GetUnderwritingRuns<
  { dealId?: string },
  UnderwritingRun[]
> = async (rawArgs, context) => {
  requireAuth(context);
  const { dealId } = ensureArgsSchemaOrThrowHttpError(
    z.object({ dealId: z.string().optional() }),
    rawArgs ?? {},
  );
  return context.entities.UnderwritingRun.findMany({
    where: { userId: context.user.id, ...(dealId ? { dealId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

async function generateUnderwritingNarrative(
  input: z.infer<typeof underwritingInputSchema>,
  output: UnderwritingOutput,
): Promise<UnderwritingNarrative> {
  const completion = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a senior real estate acquisitions analyst. Given a deal's underwriting math, produce a concise, honest institutional-quality memo. Flag risks candidly. Do not invent market data.",
      },
      {
        role: "user",
        content: JSON.stringify({ input, output }),
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "submitNarrative",
          description: "Return the underwriting narrative.",
          parameters: z.toJSONSchema(underwritingNarrativeSchema),
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: "submitNarrative" },
    },
    temperature: 0.2,
  });

  const raw = completion.choices[0].message.tool_calls?.find(
    (c) => c.type === "function",
  )?.function.arguments;
  if (!raw) throw new HttpError(500, "OpenAI did not return a narrative");
  return underwritingNarrativeSchema.parse(JSON.parse(raw));
}

// ---------- Loan Sizing ----------
export type LoanSizingResult = {
  id: string;
  output: LoanSizingOutput;
  memo: LoanMemo;
};

export const runLoanSizing: RunLoanSizing<
  z.infer<typeof loanSizingInputSchema>,
  LoanSizingResult
> = async (rawArgs, context) => {
  requireAuth(context);
  const input = ensureArgsSchemaOrThrowHttpError(
    loanSizingInputSchema,
    rawArgs,
  );
  const output = computeLoanSizing(input);
  const memo = await generateLoanMemo(input, output);

  const create = context.entities.LoanScenario.create({
    data: {
      user: { connect: { id: context.user.id } },
      ...(input.dealId
        ? { deal: { connect: { id: input.dealId } } }
        : {}),
      inputs: JSON.stringify(input),
      outputs: JSON.stringify(output),
      summary: memo.summary,
    },
  });

  const decrement = buildCreditDecrement(context.user, context);
  const [scenario] = await prisma.$transaction([create, decrement]);

  return {
    id: (scenario as LoanScenario).id,
    output,
    memo,
  };
};

export const getLoanScenarios: GetLoanScenarios<
  { dealId?: string },
  LoanScenario[]
> = async (rawArgs, context) => {
  requireAuth(context);
  const { dealId } = ensureArgsSchemaOrThrowHttpError(
    z.object({ dealId: z.string().optional() }),
    rawArgs ?? {},
  );
  return context.entities.LoanScenario.findMany({
    where: { userId: context.user.id, ...(dealId ? { dealId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

async function generateLoanMemo(
  input: z.infer<typeof loanSizingInputSchema>,
  output: LoanSizingOutput,
): Promise<LoanMemo> {
  const completion = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a senior real estate debt underwriter. Given the sizing output, produce a brief memo and rank the most appropriate lender types for this deal.",
      },
      { role: "user", content: JSON.stringify({ input, output }) },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "submitMemo",
          description: "Return the loan memo.",
          parameters: z.toJSONSchema(loanMemoSchema),
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "submitMemo" } },
    temperature: 0.2,
  });

  const raw = completion.choices[0].message.tool_calls?.find(
    (c) => c.type === "function",
  )?.function.arguments;
  if (!raw) throw new HttpError(500, "OpenAI did not return a memo");
  return loanMemoSchema.parse(JSON.parse(raw));
}

// ---------- Document Extraction ----------
export type ExtractionResult = {
  id: string;
  extracted: ExtractionOutput;
};

export const extractDocument: ExtractDocument<
  z.infer<typeof extractionInputSchema>,
  ExtractionResult
> = async (rawArgs, context) => {
  requireAuth(context);
  const input = ensureArgsSchemaOrThrowHttpError(
    extractionInputSchema,
    rawArgs,
  );

  const extracted = await extractWithAi(input);

  const create = context.entities.DocumentExtraction.create({
    data: {
      user: { connect: { id: context.user.id } },
      ...(input.dealId
        ? { deal: { connect: { id: input.dealId } } }
        : {}),
      documentType: input.documentType,
      sourceFileName: input.sourceFileName,
      extracted: JSON.stringify(extracted),
    },
  });

  const decrement = buildCreditDecrement(context.user, context);
  const [doc] = await prisma.$transaction([create, decrement]);

  return {
    id: (doc as DocumentExtraction).id,
    extracted,
  };
};

export const getDocumentExtractions: GetDocumentExtractions<
  { dealId?: string },
  DocumentExtraction[]
> = async (rawArgs, context) => {
  requireAuth(context);
  const { dealId } = ensureArgsSchemaOrThrowHttpError(
    z.object({ dealId: z.string().optional() }),
    rawArgs ?? {},
  );
  return context.entities.DocumentExtraction.findMany({
    where: { userId: context.user.id, ...(dealId ? { dealId } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

async function extractWithAi(
  input: z.infer<typeof extractionInputSchema>,
): Promise<ExtractionOutput> {
  const systemByType: Record<typeof input.documentType, string> = {
    t12:
      "You extract trailing-twelve-month operating statements. Preserve line items exactly. Compute NOI = totalIncome - totalExpenses. Set kind='t12'.",
    rent_roll:
      "You extract multifamily or commercial rent rolls. List every unit. Set kind='rent_roll'. Compute totals.",
    om:
      "You extract key facts from a commercial real estate offering memorandum. Set kind='om'.",
    loan_quote:
      "You extract key terms from a commercial real estate loan quote / term sheet. Set kind='loan_quote'.",
  };

  const completion = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemByType[input.documentType] },
      { role: "user", content: input.rawText },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "submitExtraction",
          description: "Return the structured extraction.",
          parameters: z.toJSONSchema(extractionOutputSchema),
        },
      },
    ],
    tool_choice: {
      type: "function",
      function: { name: "submitExtraction" },
    },
    temperature: 0,
  });

  const raw = completion.choices[0].message.tool_calls?.find(
    (c) => c.type === "function",
  )?.function.arguments;
  if (!raw)
    throw new HttpError(500, "OpenAI did not return an extraction");
  return extractionOutputSchema.parse(JSON.parse(raw));
}

// ---------- Admin: underwriting activity ----------
export type UnderwritingActivityDay = {
  date: string; // YYYY-MM-DD
  underwritingRuns: number;
  loanScenarios: number;
  documentExtractions: number;
};

export type UnderwritingActivityTopUser = {
  userId: string;
  email: string | null;
  username: string | null;
  underwritingRuns: number;
  loanScenarios: number;
  documentExtractions: number;
  totalRuns: number;
};

export type UnderwritingActivityRecent = {
  id: string;
  kind: "underwriting" | "loan" | "extraction";
  createdAt: Date;
  summary: string;
  userEmail: string | null;
  userUsername: string | null;
  dealName: string | null;
};

export type UnderwritingActivity = {
  totals: {
    underwritingRuns: number;
    loanScenarios: number;
    documentExtractions: number;
    deals: number;
  };
  last7Days: {
    underwritingRuns: number;
    loanScenarios: number;
    documentExtractions: number;
  };
  last30Days: {
    underwritingRuns: number;
    loanScenarios: number;
    documentExtractions: number;
  };
  trend: UnderwritingActivityDay[]; // last 30 days, ascending
  topUsers: UnderwritingActivityTopUser[]; // top 10 by total runs, last 30 days
  recent: UnderwritingActivityRecent[]; // last 20 events across all types
};

export const getUnderwritingActivity: GetUnderwritingActivity<
  void,
  UnderwritingActivity
> = async (_args, context) => {
  if (!context.user) throw new HttpError(401);
  if (!context.user.isAdmin) throw new HttpError(403, "Admin only");

  const now = new Date();
  const startOf = (daysAgo: number) => {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - daysAgo);
    return d;
  };
  const since7 = startOf(7);
  const since30 = startOf(30);

  const [
    totalUnderwriting,
    totalLoan,
    totalExtraction,
    totalDeals,
    l7Underwriting,
    l7Loan,
    l7Extraction,
    l30Underwriting,
    l30Loan,
    l30Extraction,
  ] = await Promise.all([
    context.entities.UnderwritingRun.count(),
    context.entities.LoanScenario.count(),
    context.entities.DocumentExtraction.count(),
    context.entities.Deal.count(),
    context.entities.UnderwritingRun.count({
      where: { createdAt: { gte: since7 } },
    }),
    context.entities.LoanScenario.count({
      where: { createdAt: { gte: since7 } },
    }),
    context.entities.DocumentExtraction.count({
      where: { createdAt: { gte: since7 } },
    }),
    context.entities.UnderwritingRun.count({
      where: { createdAt: { gte: since30 } },
    }),
    context.entities.LoanScenario.count({
      where: { createdAt: { gte: since30 } },
    }),
    context.entities.DocumentExtraction.count({
      where: { createdAt: { gte: since30 } },
    }),
  ]);

  // Build 30-day trend. Count in JS from createdAt lists — fine at this scale.
  const trendWindow = startOf(29); // include today -> 30 buckets
  const [runsWindow, loansWindow, extractionsWindow] = await Promise.all([
    context.entities.UnderwritingRun.findMany({
      where: { createdAt: { gte: trendWindow } },
      select: { createdAt: true, userId: true },
    }),
    context.entities.LoanScenario.findMany({
      where: { createdAt: { gte: trendWindow } },
      select: { createdAt: true, userId: true },
    }),
    context.entities.DocumentExtraction.findMany({
      where: { createdAt: { gte: trendWindow } },
      select: { createdAt: true, userId: true },
    }),
  ]);

  const toDayKey = (d: Date) => d.toISOString().slice(0, 10);
  const buckets: Record<string, UnderwritingActivityDay> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(trendWindow);
    d.setUTCDate(d.getUTCDate() + i);
    const key = toDayKey(d);
    buckets[key] = {
      date: key,
      underwritingRuns: 0,
      loanScenarios: 0,
      documentExtractions: 0,
    };
  }
  for (const r of runsWindow) {
    const k = toDayKey(r.createdAt);
    if (buckets[k]) buckets[k].underwritingRuns++;
  }
  for (const r of loansWindow) {
    const k = toDayKey(r.createdAt);
    if (buckets[k]) buckets[k].loanScenarios++;
  }
  for (const r of extractionsWindow) {
    const k = toDayKey(r.createdAt);
    if (buckets[k]) buckets[k].documentExtractions++;
  }
  const trend = Object.values(buckets).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // Top users by total runs in last 30 days.
  const userCounts: Record<
    string,
    Omit<UnderwritingActivityTopUser, "email" | "username">
  > = {};
  const bump = (
    uid: string,
    key: "underwritingRuns" | "loanScenarios" | "documentExtractions",
  ) => {
    const row = (userCounts[uid] ??= {
      userId: uid,
      underwritingRuns: 0,
      loanScenarios: 0,
      documentExtractions: 0,
      totalRuns: 0,
    });
    row[key]++;
    row.totalRuns++;
  };
  for (const r of runsWindow) bump(r.userId, "underwritingRuns");
  for (const r of loansWindow) bump(r.userId, "loanScenarios");
  for (const r of extractionsWindow) bump(r.userId, "documentExtractions");

  const topUserEntries = Object.values(userCounts)
    .sort((a, b) => b.totalRuns - a.totalRuns)
    .slice(0, 10);

  const topUserProfiles = topUserEntries.length
    ? await context.entities.User.findMany({
        where: { id: { in: topUserEntries.map((u) => u.userId) } },
        select: { id: true, email: true, username: true },
      })
    : [];
  const profileById = new Map(topUserProfiles.map((u) => [u.id, u]));

  const topUsers: UnderwritingActivityTopUser[] = topUserEntries.map((u) => {
    const p = profileById.get(u.userId);
    return {
      ...u,
      email: p?.email ?? null,
      username: p?.username ?? null,
    };
  });

  // Recent feed: last 20 events across all three types, merged and sorted.
  const [recentRuns, recentLoans, recentExtractions] = await Promise.all([
    context.entities.UnderwritingRun.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, username: true } },
        deal: { select: { name: true } },
      },
    }),
    context.entities.LoanScenario.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, username: true } },
        deal: { select: { name: true } },
      },
    }),
    context.entities.DocumentExtraction.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, username: true } },
        deal: { select: { name: true } },
      },
    }),
  ]);

  const recent: UnderwritingActivityRecent[] = [
    ...recentRuns.map((r) => ({
      id: r.id,
      kind: "underwriting" as const,
      createdAt: r.createdAt,
      summary: r.summary,
      userEmail: r.user.email,
      userUsername: r.user.username,
      dealName: r.deal?.name ?? null,
    })),
    ...recentLoans.map((r) => ({
      id: r.id,
      kind: "loan" as const,
      createdAt: r.createdAt,
      summary: r.summary,
      userEmail: r.user.email,
      userUsername: r.user.username,
      dealName: r.deal?.name ?? null,
    })),
    ...recentExtractions.map((r) => ({
      id: r.id,
      kind: "extraction" as const,
      createdAt: r.createdAt,
      summary: `${r.documentType} — ${r.sourceFileName}`,
      userEmail: r.user.email,
      userUsername: r.user.username,
      dealName: r.deal?.name ?? null,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20);

  return {
    totals: {
      underwritingRuns: totalUnderwriting,
      loanScenarios: totalLoan,
      documentExtractions: totalExtraction,
      deals: totalDeals,
    },
    last7Days: {
      underwritingRuns: l7Underwriting,
      loanScenarios: l7Loan,
      documentExtractions: l7Extraction,
    },
    last30Days: {
      underwritingRuns: l30Underwriting,
      loanScenarios: l30Loan,
      documentExtractions: l30Extraction,
    },
    trend,
    topUsers,
    recent,
  };
};
