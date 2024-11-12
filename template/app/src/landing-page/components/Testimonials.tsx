interface Testimonial {
  name: string;
  role: string;
  avatarSrc: string;
  socialUrl: string;
  quote: string;
};

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className='mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8'>
      <div className='relative sm:left-5 -m-2 rounded-xl bg-yellow-400/20 lg:ring-1 lg:ring-yellow-500/50 lg:-m-4 '>
        <div className='relative sm:top-5 sm:right-5 bg-gray-900 dark:bg-boxdark px-8 py-20 shadow-xl sm:rounded-xl sm:px-10 sm:py-16 md:px-12 lg:px-20'>
          <h2 className='text-left text-xl font-semibold tracking-wide leading-7 text-gray-500 dark:text-white'>
            What Our Users Say
          </h2>
          <div className='relative flex flex-wrap gap-6 w-full mt-6 z-10 justify-between lg:mx-0'>
            {testimonials.map((testimonial, idx) => (
              <figure key={idx} className='w-full lg:w-1/4 box-content flex flex-col justify-between p-8 rounded-xl bg-gray-500/5 '>
                <blockquote className='text-lg text-white sm:text-md sm:leading-8'>
                  <p>{testimonial.quote}</p>
                </blockquote>
                <figcaption className='mt-6 text-base text-white'>
                  <a href={testimonial.socialUrl} className='flex items-center gap-x-2'>
                    <img src={testimonial.avatarSrc} loading='lazy' className='h-12 w-12 rounded-full' />
                    <div>
                      <div className='font-semibold hover:underline'>{testimonial.name}</div>
                      <div className='mt-1'>{testimonial.role}</div>
                    </div>
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
