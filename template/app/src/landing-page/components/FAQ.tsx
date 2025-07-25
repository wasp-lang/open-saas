import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  href?: string;
}

export default function FAQ({ faqs }: { faqs: FAQ[] }) {
  return (
    <div className='mt-32 mx-auto max-w-4xl px-6 pb-8 sm:pb-24 sm:pt-12 lg:max-w-7xl lg:px-8 lg:py-32'>
      <h2 className='text-2xl font-bold leading-10 tracking-tight text-foreground text-center mb-12'>
        Frequently asked questions
      </h2>

      <Accordion type='single' collapsible className='w-full space-y-4'>
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={`faq-${faq.id}`}
            className='border border-border rounded-lg px-6 py-2 hover:bg-muted/20 transition-all duration-200'
          >
            <AccordionTrigger className='text-left text-base font-semibold leading-7 text-foreground hover:text-primary transition-colors duration-200'>
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className='text-muted-foreground'>
              <div className='flex flex-col items-start justify-between gap-4'>
                <p className='text-base leading-7 text-muted-foreground flex-1'>{faq.answer}</p>
                {faq.href && (
                  <a
                    href={faq.href}
                    className='text-base leading-7 text-primary hover:text-primary/80 transition-colors duration-200 font-medium whitespace-nowrap flex-shrink-0'
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
