import ExcelJS from "exceljs";
import type {
  LoanSizingInput,
  LoanSizingOutput,
  LoanMemo,
  UnderwritingInput,
  UnderwritingNarrative,
  UnderwritingOutput,
} from "./schemas";

const CURRENCY = '"$"#,##0;[Red]-"$"#,##0';
const PCT = "0.00%";

function setHeader(
  sheet: ExcelJS.Worksheet,
  row: number,
  text: string,
): void {
  const cell = sheet.getCell(row, 1);
  cell.value = text;
  cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E40AF" },
  };
  sheet.mergeCells(row, 1, row, 6);
}

function addKeyValue(
  sheet: ExcelJS.Worksheet,
  row: number,
  label: string,
  value: number | string,
  format?: string,
): void {
  sheet.getCell(row, 1).value = label;
  const valueCell = sheet.getCell(row, 2);
  valueCell.value = value;
  if (format && typeof value === "number") {
    valueCell.numFmt = format;
  }
  sheet.getCell(row, 1).font = { bold: true };
}

export async function buildUnderwritingWorkbook(params: {
  dealName: string | null;
  input: UnderwritingInput;
  output: UnderwritingOutput;
  narrative: UnderwritingNarrative;
  createdAt: Date;
}): Promise<Buffer> {
  const { dealName, input, output, narrative, createdAt } = params;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Underwrite AI";
  wb.created = createdAt;

  // --- Summary sheet ---
  const summary = wb.addWorksheet("Summary");
  summary.columns = [{ width: 32 }, { width: 22 }];
  setHeader(summary, 1, `Underwriting — ${dealName ?? "Unnamed deal"}`);
  summary.getCell(2, 1).value = `Generated ${createdAt.toISOString().slice(0, 10)}`;
  summary.getCell(2, 1).font = { italic: true, color: { argb: "FF6B7280" } };

  setHeader(summary, 4, "Key metrics");
  addKeyValue(summary, 5, "Loan amount", output.loanAmount, CURRENCY);
  addKeyValue(summary, 6, "Equity required", output.equityRequired, CURRENCY);
  addKeyValue(summary, 7, "Year 1 DSCR", output.year1DSCR);
  addKeyValue(
    summary,
    8,
    "Year 1 cash-on-cash",
    output.year1CashOnCashPct / 100,
    PCT,
  );
  addKeyValue(summary, 9, "Levered IRR", output.leveredIRRPct / 100, PCT);
  addKeyValue(summary, 10, "Unlevered IRR", output.unleveredIRRPct / 100, PCT);
  addKeyValue(summary, 11, "Equity multiple", output.equityMultiple);
  addKeyValue(summary, 12, "Exit value", output.exitValue, CURRENCY);
  addKeyValue(summary, 13, "Sale proceeds", output.saleProceeds, CURRENCY);

  setHeader(summary, 15, "Recommendation");
  summary.getCell(16, 1).value = "Recommendation";
  summary.getCell(16, 1).font = { bold: true };
  summary.getCell(16, 2).value = narrative.recommendation;
  summary.getCell(17, 1).value = "Executive summary";
  summary.getCell(17, 1).font = { bold: true };
  summary.getCell(18, 1).value = narrative.executiveSummary;
  summary.mergeCells(18, 1, 18, 6);
  summary.getRow(18).height = 60;
  summary.getCell(18, 1).alignment = { wrapText: true, vertical: "top" };

  // --- Assumptions sheet ---
  const assumptions = wb.addWorksheet("Assumptions");
  assumptions.columns = [{ width: 32 }, { width: 22 }];
  setHeader(assumptions, 1, "Deal assumptions");
  const rows: Array<[string, number | string, string | undefined]> = [
    ["Asset class", input.assetClass, undefined],
    ["Market", input.market || "—", undefined],
    ["Purchase price", input.purchasePrice, CURRENCY],
    ["Year 1 NOI", input.year1Noi, CURRENCY],
    ["Rent growth", input.rentGrowthPct / 100, PCT],
    ["Expense growth", input.expenseGrowthPct / 100, PCT],
    ["Vacancy", input.vacancyPct / 100, PCT],
    ["Exit cap rate", input.exitCapRatePct / 100, PCT],
    ["Hold period (yrs)", input.holdPeriodYears, undefined],
    ["LTV", input.ltvPct / 100, PCT],
    ["Interest rate", input.interestRatePct / 100, PCT],
    ["Amort (yrs)", input.amortYears, undefined],
    ["Interest-only (yrs)", input.interestOnlyYears, undefined],
  ];
  rows.forEach(([label, value, fmt], i) => {
    addKeyValue(assumptions, i + 2, label, value, fmt);
  });

  // --- Cash flow sheet ---
  const cf = wb.addWorksheet("Cash Flow");
  cf.columns = [
    { header: "Year", key: "year", width: 8 },
    { header: "NOI", key: "noi", width: 18, style: { numFmt: CURRENCY } },
    {
      header: "Debt service",
      key: "debtService",
      width: 18,
      style: { numFmt: CURRENCY },
    },
    {
      header: "Cash flow",
      key: "cashFlow",
      width: 18,
      style: { numFmt: CURRENCY },
    },
    {
      header: "Cash-on-cash",
      key: "cashOnCashPct",
      width: 15,
      style: { numFmt: PCT },
    },
  ];
  cf.getRow(1).font = { bold: true };
  output.cashFlows.forEach((r) => {
    cf.addRow({
      year: r.year,
      noi: r.noi,
      debtService: r.debtService,
      cashFlow: r.cashFlow,
      cashOnCashPct: r.cashOnCashPct / 100,
    });
  });
  cf.addRow({
    year: "Exit",
    noi: "",
    debtService: "",
    cashFlow: output.saleProceeds,
    cashOnCashPct: "",
  }).font = { italic: true };

  // --- Sensitivity sheet ---
  const sens = wb.addWorksheet("Sensitivity");
  sens.columns = [
    { header: "Exit cap rate", key: "exitCapRatePct", width: 15, style: { numFmt: PCT } },
    { header: "Rent growth", key: "rentGrowthPct", width: 15, style: { numFmt: PCT } },
    {
      header: "Levered IRR",
      key: "leveredIRRPct",
      width: 15,
      style: { numFmt: PCT },
    },
  ];
  sens.getRow(1).font = { bold: true };
  output.sensitivity.forEach((s) => {
    sens.addRow({
      exitCapRatePct: s.exitCapRatePct / 100,
      rentGrowthPct: s.rentGrowthPct / 100,
      leveredIRRPct: s.leveredIRRPct / 100,
    });
  });

  // --- Memo sheet ---
  const memo = wb.addWorksheet("Memo");
  memo.columns = [{ width: 120 }];
  setHeader(memo, 1, "Investment committee memo");
  memo.getCell(3, 1).value = "Executive summary";
  memo.getCell(3, 1).font = { bold: true };
  memo.getCell(4, 1).value = narrative.executiveSummary;
  memo.getCell(4, 1).alignment = { wrapText: true, vertical: "top" };
  memo.getRow(4).height = 50;

  let row = 6;
  const list = (title: string, items: string[]) => {
    memo.getCell(row, 1).value = title;
    memo.getCell(row, 1).font = { bold: true };
    row++;
    items.forEach((item) => {
      memo.getCell(row, 1).value = `• ${item}`;
      memo.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
      memo.getRow(row).height = 24;
      row++;
    });
    row++;
  };
  list("Strengths", narrative.strengths);
  list("Risks", narrative.risks);
  memo.getCell(row, 1).value = "Recommendation";
  memo.getCell(row, 1).font = { bold: true };
  row++;
  memo.getCell(row, 1).value = narrative.recommendation;
  row++;
  memo.getCell(row, 1).value = narrative.recommendationRationale;
  memo.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
  memo.getRow(row).height = 60;

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer as ArrayBuffer);
}

export async function buildLoanSizingWorkbook(params: {
  dealName: string | null;
  input: LoanSizingInput;
  output: LoanSizingOutput;
  memo: LoanMemo;
  createdAt: Date;
}): Promise<Buffer> {
  const { dealName, input, output, memo, createdAt } = params;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Underwrite AI";
  wb.created = createdAt;

  // Sizing summary
  const s = wb.addWorksheet("Sizing");
  s.columns = [{ width: 32 }, { width: 22 }];
  setHeader(s, 1, `Loan sizing — ${dealName ?? "Unnamed deal"}`);
  s.getCell(2, 1).value = `Generated ${createdAt.toISOString().slice(0, 10)}`;
  s.getCell(2, 1).font = { italic: true, color: { argb: "FF6B7280" } };

  setHeader(s, 4, "Max loan by constraint");
  addKeyValue(s, 5, "LTV", output.maxLoanByLtv, CURRENCY);
  addKeyValue(s, 6, "DSCR", output.maxLoanByDscr, CURRENCY);
  addKeyValue(s, 7, "Debt yield", output.maxLoanByDebtYield, CURRENCY);
  addKeyValue(s, 8, "Binding constraint", output.bindingConstraint);

  setHeader(s, 10, "Recommended loan");
  addKeyValue(s, 11, "Loan amount", output.recommendedLoan, CURRENCY);
  addKeyValue(s, 12, "Resulting LTV", output.resultingLtvPct / 100, PCT);
  addKeyValue(s, 13, "Resulting DSCR", output.resultingDscr);
  addKeyValue(
    s,
    14,
    "Resulting debt yield",
    output.resultingDebtYieldPct / 100,
    PCT,
  );
  addKeyValue(s, 15, "Annual debt service", output.annualDebtService, CURRENCY);
  addKeyValue(s, 16, "Monthly payment", output.monthlyPayment, CURRENCY);

  // Inputs sheet
  const a = wb.addWorksheet("Inputs");
  a.columns = [{ width: 32 }, { width: 22 }];
  setHeader(a, 1, "Sizing inputs");
  const inputRows: Array<[string, number | string, string | undefined]> = [
    ["Asset class", input.assetClass, undefined],
    ["Purchase price", input.purchasePrice, CURRENCY],
    ["Stabilized NOI", input.stabilizedNoi, CURRENCY],
    ["Interest rate", input.interestRatePct / 100, PCT],
    ["Amort (yrs)", input.amortYears, undefined],
    ["Term (yrs)", input.termYears, undefined],
    ["Interest-only (yrs)", input.interestOnlyYears, undefined],
    ["DSCR target", input.dscrTarget, undefined],
    ["Max LTV", input.maxLtvPct / 100, PCT],
    ["Min debt yield", input.minDebtYieldPct / 100, PCT],
  ];
  inputRows.forEach(([label, value, fmt], i) => {
    addKeyValue(a, i + 2, label, value, fmt);
  });

  // Memo sheet
  const m = wb.addWorksheet("Memo");
  m.columns = [{ width: 120 }];
  setHeader(m, 1, "Debt memo");
  m.getCell(3, 1).value = "Summary";
  m.getCell(3, 1).font = { bold: true };
  m.getCell(4, 1).value = memo.summary;
  m.getCell(4, 1).alignment = { wrapText: true, vertical: "top" };
  m.getRow(4).height = 50;

  let row = 6;
  if (memo.riskFactors.length) {
    m.getCell(row, 1).value = "Risk factors";
    m.getCell(row, 1).font = { bold: true };
    row++;
    memo.riskFactors.forEach((item) => {
      m.getCell(row, 1).value = `• ${item}`;
      m.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
      m.getRow(row).height = 24;
      row++;
    });
    row++;
  }
  m.getCell(row, 1).value = "Lender fit (best first)";
  m.getCell(row, 1).font = { bold: true };
  row++;
  memo.lenderFit.forEach((l) => {
    m.getCell(row, 1).value = `${l.lenderType} — ${l.rationale}`;
    m.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
    m.getRow(row).height = 30;
    row++;
  });

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer as ArrayBuffer);
}

export function safeFilename(base: string, ext = "xlsx"): string {
  const cleaned = base
    .trim()
    .replace(/[^a-zA-Z0-9\-_ ]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `${cleaned || "export"}.${ext}`;
}
