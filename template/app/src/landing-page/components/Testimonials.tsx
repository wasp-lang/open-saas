import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '../../components/ui/card';

interface Testimonial {
  name: string;
  role: string;
  avatarSrc: string;
  socialUrl: string;
  quote: string;
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className='mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8'>
      <h2 className='text-left text-xl font-semibold tracking-wide leading-7 text-muted-foreground dark:text-foreground mb-8'>
        What Our Users Say
      </h2>

      <div className='relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full z-10'>
        {testimonials.map((testimonial, idx) => (
          <Card
            key={idx}
            className='group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card-accent'
          >
            <CardContent className='p-6'>
              <blockquote className='text-sm leading-6 text-muted-foreground mb-4'>
                <p className='italic'>"{testimonial.quote}"</p>
              </blockquote>
            </CardContent>
            <CardFooter className='pt-0'>
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
                  <CardTitle className='text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate'>
                    {testimonial.name}
                  </CardTitle>
                  <CardDescription className='text-xs text-muted-foreground truncate'>
                    {testimonial.role}
                  </CardDescription>
                </div>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
