import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';

interface ExampleApp {
  name: string;
  description: string;
  imageSrc: string;
  href: string;
}

/**
 * Infinite horizontally scrolling carousel of example apps.
 *
 * @param examples - The examples to display in the carousel.
 * @returns An infinite scrolling carousel of examples.
 */
const ExamplesCarousel = ({ examples }: { examples: ExampleApp[] }) => {
  const [isInView, setIsInView] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const duplicatedExamples = [...examples, ...examples, ...examples];

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInView || isPaused || !scrollContainerRef.current) {
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    const scrollStep = 0.5;
    const fps = 60;
    const interval = 1000 / fps;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += scrollStep;
      }
    };

    const scrollInterval = setInterval(scroll, interval);
    return () => clearInterval(scrollInterval);
  }, [isInView, isPaused]);

  return (
    <div ref={containerRef} className='flex flex-col items-center my-10'>
      <h2 className='mb-6 text-center font-semibold tracking-wide text-muted-foreground'>Used by:</h2>
      <div className='w-full max-w-full overflow-hidden'>
        <div
          ref={scrollContainerRef}
          className='flex overflow-x-auto scroll-smooth pb-10 no-scrollbar gap-4 px-4'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {duplicatedExamples.map((example, index) => (
            <Card
              key={index}
              className='flex-shrink-0 overflow-hidden cursor-pointer w-[280px] sm:w-[320px] md:w-[350px]'
              variant='default'
              onClick={() => window.open(example.href, '_blank')}
            >
              <CardContent className='p-0 h-full'>
                <img src={example.imageSrc} alt={example.name} className='w-full h-auto aspect-video' />
                <div className='p-4'>
                  <p className='font-bold'>{example.name}</p>
                  <p className='text-xs text-muted-foreground'>{example.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamplesCarousel;
