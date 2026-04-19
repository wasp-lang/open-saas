import type {
  LoanSizingInput,
  LoanSizingOutput,
  UnderwritingInput,
  UnderwritingOutput,
} from "./schemas";

// Monthly mortgage payment for a fully amortizing loan.
export function monthlyPayment(
  principal: number,
  annualRatePct: number,
  amortYears: number,
): number {
  const r = annualRatePct / 100 / 12;
  const n = amortYears * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

// IRR using Newton's method with bisection fallback.
export function irr(cashFlows: number[], guess = 0.1): number {
  const npv = (rate: number) =>
    cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);

  let lo = -0.999;
  let hi = 10;
  if (npv(lo) * npv(hi) > 0) return guess;

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const v = npv(mid);
    if (Math.abs(v) < 1e-7) return mid;
    if (npv(lo) * v < 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export function computeUnderwriting(
  input: UnderwritingInput,
): UnderwritingOutput {
  const {
    purchasePrice,
    year1Noi,
    rentGrowthPct,
    expenseGrowthPct,
    vacancyPct,
    exitCapRatePct,
    holdPeriodYears,
    ltvPct,
    interestRatePct,
    amortYears,
    interestOnlyYears,
  } = input;

  const loanAmount = purchasePrice * (ltvPct / 100);
  const equityRequired = purchasePrice - loanAmount;

  const monthlyPmt = monthlyPayment(
    loanAmount,
    interestRatePct,
    amortYears,
  );
  const annualPmt = monthlyPmt * 12;
  const ioAnnualInterest = loanAmount * (interestRatePct / 100);

  // Project NOI year-by-year. We model rent growth minus expense growth as a
  // blended growth for simplicity, then apply vacancy as a haircut.
  const vacancyAdj = 1 - vacancyPct / 100;
  const netGrowth =
    (rentGrowthPct - expenseGrowthPct) / 100; // simplified blend

  const cashFlows: UnderwritingOutput["cashFlows"] = [];
  const unleveredStream: number[] = [-purchasePrice];
  const leveredStream: number[] = [-equityRequired];

  let runningNoi = year1Noi * vacancyAdj;
  for (let y = 1; y <= holdPeriodYears; y++) {
    if (y > 1) runningNoi *= 1 + netGrowth;
    const debtService = y <= interestOnlyYears ? ioAnnualInterest : annualPmt;
    const levered = runningNoi - debtService;
    const cashOnCashPct = (levered / equityRequired) * 100;

    cashFlows.push({
      year: y,
      noi: runningNoi,
      debtService,
      cashFlow: levered,
      cashOnCashPct,
    });

    if (y < holdPeriodYears) {
      unleveredStream.push(runningNoi);
      leveredStream.push(levered);
    }
  }

  // Terminal year: include sale proceeds.
  const year11Noi = runningNoi * (1 + netGrowth);
  const exitValue = year11Noi / (exitCapRatePct / 100);
  // Approximate remaining loan balance.
  const remainingBalance = estimateRemainingBalance(
    loanAmount,
    interestRatePct,
    amortYears,
    Math.max(holdPeriodYears - interestOnlyYears, 0),
  );
  const saleProceeds = exitValue - remainingBalance;
  const finalYearLevered =
    cashFlows[cashFlows.length - 1].cashFlow + saleProceeds;
  const finalYearUnlevered =
    cashFlows[cashFlows.length - 1].noi + exitValue;

  unleveredStream.push(finalYearUnlevered);
  leveredStream.push(finalYearLevered);

  const leveredIRR = irr(leveredStream) * 100;
  const unleveredIRR = irr(unleveredStream) * 100;

  const totalLeveredProceeds =
    cashFlows.reduce((a, cf) => a + cf.cashFlow, 0) + saleProceeds;
  const equityMultiple = totalLeveredProceeds / equityRequired + 1;

  const year1CashFlow = cashFlows[0].cashFlow;
  const year1DSCR = cashFlows[0].noi / cashFlows[0].debtService;

  const sensitivity: UnderwritingOutput["sensitivity"] = [];
  for (const capDelta of [-0.5, 0, 0.5]) {
    for (const growthDelta of [-1, 0, 1]) {
      const altInput: UnderwritingInput = {
        ...input,
        exitCapRatePct: exitCapRatePct + capDelta,
        rentGrowthPct: rentGrowthPct + growthDelta,
      };
      // Avoid infinite recursion: compute a shallow recomputation inline.
      const altIRR = recomputeLeveredIRR(altInput);
      sensitivity.push({
        exitCapRatePct: altInput.exitCapRatePct,
        rentGrowthPct: altInput.rentGrowthPct,
        leveredIRRPct: altIRR,
      });
    }
  }

  return {
    loanAmount,
    equityRequired,
    year1DSCR,
    year1CashOnCashPct: (year1CashFlow / equityRequired) * 100,
    leveredIRRPct: leveredIRR,
    unleveredIRRPct: unleveredIRR,
    equityMultiple,
    saleProceeds,
    exitValue,
    cashFlows,
    sensitivity,
  };
}

function recomputeLeveredIRR(input: UnderwritingInput): number {
  const {
    purchasePrice,
    year1Noi,
    rentGrowthPct,
    expenseGrowthPct,
    vacancyPct,
    exitCapRatePct,
    holdPeriodYears,
    ltvPct,
    interestRatePct,
    amortYears,
    interestOnlyYears,
  } = input;
  const loanAmount = purchasePrice * (ltvPct / 100);
  const equityRequired = purchasePrice - loanAmount;
  const monthlyPmt = monthlyPayment(loanAmount, interestRatePct, amortYears);
  const annualPmt = monthlyPmt * 12;
  const ioAnnualInterest = loanAmount * (interestRatePct / 100);
  const vacancyAdj = 1 - vacancyPct / 100;
  const netGrowth = (rentGrowthPct - expenseGrowthPct) / 100;

  const leveredStream: number[] = [-equityRequired];
  let runningNoi = year1Noi * vacancyAdj;
  for (let y = 1; y <= holdPeriodYears; y++) {
    if (y > 1) runningNoi *= 1 + netGrowth;
    const ds = y <= interestOnlyYears ? ioAnnualInterest : annualPmt;
    const levered = runningNoi - ds;
    if (y < holdPeriodYears) leveredStream.push(levered);
    else {
      const year11Noi = runningNoi * (1 + netGrowth);
      const exit = year11Noi / (exitCapRatePct / 100);
      const rem = estimateRemainingBalance(
        loanAmount,
        interestRatePct,
        amortYears,
        Math.max(holdPeriodYears - interestOnlyYears, 0),
      );
      leveredStream.push(levered + (exit - rem));
    }
  }
  return irr(leveredStream) * 100;
}

// Outstanding balance after `yearsPaid` of amortization on an originally
// amortizing loan.
function estimateRemainingBalance(
  principal: number,
  annualRatePct: number,
  amortYears: number,
  yearsPaid: number,
): number {
  if (yearsPaid <= 0) return principal;
  const r = annualRatePct / 100 / 12;
  const n = amortYears * 12;
  const k = Math.min(yearsPaid * 12, n);
  if (r === 0) return Math.max(principal - (principal / n) * k, 0);
  const pmt = (principal * r) / (1 - Math.pow(1 + r, -n));
  const balance =
    principal * Math.pow(1 + r, k) - pmt * ((Math.pow(1 + r, k) - 1) / r);
  return Math.max(balance, 0);
}

export function computeLoanSizing(input: LoanSizingInput): LoanSizingOutput {
  const {
    purchasePrice,
    stabilizedNoi,
    interestRatePct,
    amortYears,
    interestOnlyYears,
    dscrTarget,
    maxLtvPct,
    minDebtYieldPct,
  } = input;

  const maxLoanByLtv = purchasePrice * (maxLtvPct / 100);

  // Max loan by DSCR: NOI / DSCR = max annual debt service. Back-solve loan.
  const maxAnnualDs = stabilizedNoi / dscrTarget;
  const r = interestRatePct / 100 / 12;
  const n = amortYears * 12;
  const pmtMultiplier = r === 0 ? 1 / n : r / (1 - Math.pow(1 + r, -n));
  const maxMonthly = maxAnnualDs / 12;
  const maxLoanByDscr = maxMonthly / pmtMultiplier;

  // During interest-only, debt service is simply rate × principal.
  // Use the more conservative of IO-constrained vs amortizing-constrained.
  const maxLoanByDscrIO = maxAnnualDs / (interestRatePct / 100);
  const effectiveMaxLoanByDscr =
    interestOnlyYears > 0
      ? Math.min(maxLoanByDscr, maxLoanByDscrIO)
      : maxLoanByDscr;

  const maxLoanByDebtYield = stabilizedNoi / (minDebtYieldPct / 100);

  const candidates: [number, LoanSizingOutput["bindingConstraint"]][] = [
    [maxLoanByLtv, "LTV"],
    [effectiveMaxLoanByDscr, "DSCR"],
    [maxLoanByDebtYield, "DebtYield"],
  ];
  const [recommendedLoan, bindingConstraint] = candidates.reduce((a, b) =>
    a[0] < b[0] ? a : b,
  );

  const actualMonthly = monthlyPayment(
    recommendedLoan,
    interestRatePct,
    amortYears,
  );
  const actualAnnual = actualMonthly * 12;

  return {
    maxLoanByLtv,
    maxLoanByDscr: effectiveMaxLoanByDscr,
    maxLoanByDebtYield,
    recommendedLoan,
    bindingConstraint,
    annualDebtService: actualAnnual,
    monthlyPayment: actualMonthly,
    resultingLtvPct: (recommendedLoan / purchasePrice) * 100,
    resultingDscr: stabilizedNoi / actualAnnual,
    resultingDebtYieldPct: (stabilizedNoi / recommendedLoan) * 100,
  };
}
