import { forwardRef, useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';

const EXAMPLES_CAROUSEL_INTERVAL = 3000;
const EXAMPLES_CAROUSEL_SCROLL_TIMEOUT = 200;

interface ExampleApp {
  name: string;
  description: string;
  imageSrc: string;
  href: string;
}

const ExamplesCarousel = ({ examples }: { examples: ExampleApp[] }) => {
  const [currentExample, setCurrentExample] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      threshold: 0.5,
      rootMargin: '-200px 0px -100px 0px',
    });

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isInView && examples.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentExample((prev) => (prev + 1) % examples.length);
      }, EXAMPLES_CAROUSEL_INTERVAL);
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (scrollContainerRef.current) {
        const scrollContainer = scrollContainerRef.current;
        const targetCard = scrollContainer.children[currentExample] as HTMLElement | undefined;

        if (targetCard) {
          const containerRect = scrollContainer.getBoundingClientRect();
          const cardRect = targetCard.getBoundingClientRect();
          const scrollLeft =
            targetCard.offsetLeft - scrollContainer.offsetLeft - containerRect.width / 2 + cardRect.width / 2;

          scrollContainer.scrollTo({
            left: scrollLeft,
            behavior: 'smooth',
          });
        }
      }
    }, EXAMPLES_CAROUSEL_SCROLL_TIMEOUT);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isInView, examples.length, currentExample]);

  const handleMouseEnter = (index: number) => {
    setCurrentExample(index);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isInView && examples.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentExample((prev) => (prev + 1) % examples.length);
      }, EXAMPLES_CAROUSEL_INTERVAL);
    }
  };

  return (
    <div
      ref={containerRef}
      className='relative w-screen left-1/2 -translate-x-1/2 flex flex-col items-center my-16'
    >
      <h2 className='mb-6 text-center font-semibold tracking-wide text-muted-foreground'>Used by:</h2>
      <div className='w-full max-w-full overflow-hidden'>
        <div
          className='flex overflow-x-auto no-scrollbar scroll-smooth pb-10 pt-4 gap-4 px-4 snap-x snap-mandatory'
          ref={scrollContainerRef}
        >
          {examples.map((example, index) => (
            <ExampleCard
              key={index}
              example={example}
              index={index}
              isCurrent={index === currentExample}
              onMouseEnter={handleMouseEnter}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ExampleCardProps {
  example: ExampleApp;
  index: number;
  isCurrent: boolean;
  onMouseEnter: (index: number) => void;
}

const ExampleCard = forwardRef<HTMLDivElement, ExampleCardProps>(
  ({ example, index, isCurrent, onMouseEnter }, ref) => {
    return (
      <a
        href={example.href}
        target='_blank'
        rel='noopener noreferrer'
        className='flex-shrink-0 snap-center'
        onMouseEnter={() => onMouseEnter(index)}
      >
        <Card
          ref={ref}
          className='overflow-hidden w-[280px] sm:w-[320px] md:w-[350px] transition-all duration-200 hover:scale-105'
          variant={isCurrent ? 'default' : 'faded'}
        >
          <CardContent className='p-0 h-full'>
            <img src={example.imageSrc} alt={example.name} className='w-full h-auto aspect-video' />
            <div className='p-4'>
              <p className='font-bold'>{example.name}</p>
              <p className='text-xs text-muted-foreground'>{example.description}</p>
            </div>
          </CardContent>
        </Card>
      </a>
    );
  }
);

ExampleCard.displayName = 'ExampleCard';

export default ExamplesCarousel;
