import { BlogUrl, DocsUrl } from "../shared/common";
import type { GridFeature } from "./components/FeaturesGrid";

export const features: GridFeature[] = [
  {
    name: "Underwriting pro formas in seconds",
    description:
      "10-year cash flows, levered IRR, equity multiple, DSCR, sensitivity table — not a spreadsheet, a decision.",
    emoji: "📊",
    href: DocsUrl,
    size: "large",
  },
  {
    name: "Debt sizing & lender fit",
    description:
      "Max proceeds across LTV, DSCR, and debt-yield. Ranked lender-type fit with a debt memo.",
    emoji: "🏦",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "T-12 & rent roll extraction",
    description:
      "Paste an operating statement or rent roll — get structured, underwriting-ready data instantly.",
    emoji: "📄",
    href: DocsUrl,
    size: "medium",
  },
  {
    name: "Investment committee memos",
    description:
      "Executive summary, strengths, risks, and a candid recommendation generated from your numbers.",
    emoji: "🧠",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Multifamily, office, industrial, retail, hotel",
    description:
      "Asset-class aware assumptions so outputs reflect how your product actually underwrites.",
    emoji: "🏢",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Credit-based pricing",
    description:
      "Monthly allotment plus top-up packs. Only pay for the analyses you actually run.",
    emoji: "💳",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Replaces your junior analyst",
    description:
      "Acquisitions, asset management, and debt shops ship more deal memos with a smaller team.",
    emoji: "⚡",
    href: DocsUrl,
    size: "small",
  },
  {
    name: "Keeps your assumptions under your control",
    description:
      "No black box. Tweak rent growth, exit cap, vacancy, DSCR target and watch every output update.",
    emoji: "🎛️",
    href: DocsUrl,
    size: "medium",
  },
];

export const testimonials = [
  {
    name: "Avery K.",
    role: "Principal, Value-Add Multifamily Fund",
    avatarSrc: "",
    socialUrl: "",
    quote:
      "We underwrote 40 deals last month with one associate instead of three. The debt memo alone paid for the year.",
  },
  {
    name: "Jordan M.",
    role: "VP Acquisitions, Core-Plus Industrial",
    avatarSrc: "",
    socialUrl: "",
    quote:
      "Pasting a rent roll and getting a clean spreadsheet in 10 seconds is borderline unfair. This is the first product that actually replaces analyst work.",
  },
  {
    name: "Priya R.",
    role: "Director, Debt Origination",
    avatarSrc: "",
    socialUrl: "",
    quote:
      "The binding-constraint output and lender-fit memo matches how I'd size it manually. I run every new quote through it.",
  },
];

export const faqs = [
  {
    id: 1,
    question: "How do credits work?",
    answer:
      "Every subscription tier includes a monthly credit allotment. Each underwriting run, loan sizing scenario, or document extraction costs 1 credit. Need more? Buy a top-up credit pack any time — credits never expire.",
    href: "/pricing",
  },
  {
    id: 2,
    question: "Does it replace our analysts entirely?",
    answer:
      "That's the design goal. Deals under, say, $50M move end-to-end through Underwrite AI without a human touching a spreadsheet. Larger, structured deals still benefit from human judgment — but you spend that judgment on the decision, not the modeling.",
    href: "#",
  },
  {
    id: 3,
    question: "What asset classes are supported?",
    answer:
      "Multifamily, office, industrial, retail, hotel, and mixed-use. Assumptions and memo prompts are tuned per asset class.",
    href: "#",
  },
  {
    id: 4,
    question: "Is my deal data private?",
    answer:
      "Yes. Deals, pro formas, debt scenarios, and extractions are scoped to your account. We don't train on customer data.",
    href: "#",
  },
];

export const footerNavigation = {
  app: [
    { name: "Pricing", href: "/pricing" },
    { name: "Documentation", href: DocsUrl },
    { name: "Blog", href: BlogUrl },
  ],
  company: [
    { name: "About", href: "#" },
    { name: "Privacy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ],
};

export const examples = [
  {
    name: "Value-add multifamily",
    description:
      "150-unit garden-style underwritten in 12 seconds: levered IRR, sensitivity grid, analyst memo with risks and a go/no-go recommendation.",
    imageSrc: "",
    href: "#",
  },
  {
    name: "Industrial portfolio refinance",
    description:
      "Debt sizing across 3 lender profiles; binding constraint auto-detected; lender-fit ranking with rationale.",
    imageSrc: "",
    href: "#",
  },
  {
    name: "Rent roll in, pro forma out",
    description:
      "Paste a 120-unit rent roll; get occupancy, total monthly revenue, and a T-12-comparable income line ready to model.",
    imageSrc: "",
    href: "#",
  },
  {
    name: "Debt broker workflow",
    description:
      "Ingest a term sheet, normalize key terms, stack multiple quotes side-by-side for the borrower.",
    imageSrc: "",
    href: "#",
  },
];
