import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../client/components/ui/accordion";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  href?: string;
}

export default function FAQ({ faqs }: { faqs: FAQ[] }) {
  return (
    <div className="mx-auto mt-32 max-w-4xl px-6 pb-8 sm:pt-12 sm:pb-24 lg:max-w-7xl lg:px-8 lg:py-32">
      <h2 className="text-foreground mb-12 text-center text-2xl leading-10 font-bold tracking-tight">
        Frequently asked questions
      </h2>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={`faq-${faq.id}`}
            className="border-border hover:bg-muted/20 rounded-lg border px-6 py-2 transition-all duration-200"
          >
            <AccordionTrigger className="text-foreground hover:text-primary text-left text-base leading-7 font-semibold transition-colors duration-200">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <div className="flex flex-col items-start justify-between gap-4">
                <p className="text-muted-foreground flex-1 text-base leading-7">
                  {faq.answer}
                </p>
                {faq.href && (
                  <a
                    href={faq.href}
                    className="text-primary hover:text-primary/80 shrink-0 text-base leading-7 font-medium whitespace-nowrap transition-colors duration-200"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
