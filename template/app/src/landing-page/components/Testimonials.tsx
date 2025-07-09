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
      <div className='relative sm:left-5 -m-2 rounded-xl bg-primary/10 lg:ring-1 lg:ring-primary/20 lg:-m-4 transition-all duration-300 hover:bg-primary/15'>
        <div className='relative sm:top-5 sm:right-5 bg-card dark:bg-card px-8 py-20 shadow-xl sm:rounded-xl sm:px-10 sm:py-16 md:px-12 lg:px-20 border border-border/50'>
          <h2 className='text-left text-xl font-semibold tracking-wide leading-7 text-muted-foreground dark:text-foreground'>
            What Our Users Say
          </h2>
          <div className='relative flex flex-wrap gap-6 w-full mt-6 z-10 justify-between lg:mx-0'>
            {testimonials.map((testimonial, idx) => (
              <figure
                key={idx}
                className='w-full lg:w-1/4 box-content flex flex-col justify-between p-8 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 border border-border/20 hover:border-border/40'
              >
                <blockquote className='text-lg text-foreground sm:text-md sm:leading-8'>
                  <p className='text-muted-foreground'>{testimonial.quote}</p>
                </blockquote>
                <figcaption className='mt-6 text-base text-foreground'>
                  <a
                    href={testimonial.socialUrl}
                    className='flex items-center gap-x-2 group transition-all duration-200 hover:opacity-80'
                  >
                    <img
                      src={testimonial.avatarSrc}
                      loading='lazy'
                      className='h-12 w-12 rounded-full ring-2 ring-border/20 group-hover:ring-primary/30 transition-all duration-200'
                    />
                    <div>
                      <div className='font-semibold text-foreground group-hover:text-primary transition-colors duration-200'>
                        {testimonial.name}
                      </div>
                      <div className='mt-1 text-muted-foreground'>{testimonial.role}</div>
                    </div>
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
