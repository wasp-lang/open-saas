import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '../../components/ui/card';
import SectionTitle from './SectionTitle';

interface Testimonial {
  name: string;
  role: string;
  avatarSrc: string;
  socialUrl: string;
  quote: string;
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowExpand = testimonials.length > 5;
  const mobileItemsToShow = 3;
  const itemsToShow = shouldShowExpand && !isExpanded ? mobileItemsToShow : testimonials.length;

  return (
    <div className='mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8'>
      <SectionTitle title='What Our Users Say' />

      <div className='relative w-full z-10 px-4 md:px-0 columns-1 md:columns-2 lg:columns-3 gap-2 md:gap-6'>
        {testimonials.slice(0, itemsToShow).map((testimonial, idx) => (
          <div key={idx} className='break-inside-avoid mb-6'>
            <Card className='flex flex-col justify-between'>
              <CardContent className='p-6'>
                <blockquote className='leading-6 mb-4'>
                  <p className='italic text-sm'>{testimonial.quote}</p>
                </blockquote>
              </CardContent>
              <CardFooter className='pt-0 flex flex-col'>
                <a
                  href={testimonial.socialUrl}
                  className='flex items-center gap-x-3 group transition-all duration-200 hover:opacity-80 w-full'
                >
                  <img
                    src={testimonial.avatarSrc}
                    loading='lazy'
                    alt={`${testimonial.name}'s avatar`}
                    className='h-10 w-10 rounded-full ring-2 ring-border/20 group-hover:ring-primary/30 transition-all duration-200 flex-shrink-0'
                  />
                  <div className='min-w-0 flex-1'>
                    <CardTitle className='text-sm font-semibold group-hover:text-card-foreground transition-colors duration-200 truncate'>
                      {testimonial.name}
                    </CardTitle>
                    <CardDescription className='text-xs truncate'>{testimonial.role}</CardDescription>
                  </div>
                </a>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>

      {shouldShowExpand && (
        <div className='flex justify-center mt-8 md:hidden'>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='px-6 py-3 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors duration-200'
          >
            {isExpanded ? 'Show Less' : `Show ${testimonials.length - mobileItemsToShow} More`}
          </button>
        </div>
      )}
    </div>
  );
}
