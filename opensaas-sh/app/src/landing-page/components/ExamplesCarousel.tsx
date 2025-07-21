import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';

interface ExampleApp {
  name: string;
  description: string;
  imageSrc: string;
  href: string;
}

const ExamplesCarousel = ({ examples }: { examples: ExampleApp[] }) => {
  const [currentExample, setCurrentExample] = useState(Math.floor(examples.length / 2 - 1));
  const [hoveredExample, setHoveredExample] = useState<number | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [shouldCenter, setShouldCenter] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleMouseEnter = (index: number) => setHoveredExample(index);
  const handleMouseLeave = (index: number) => {
    setCurrentExample(index);
    setHoveredExample(null);
  };

  const scrollToCenter = () => {
    if (hoveredExample !== null) return;

    const container = containerRef.current?.querySelector('.flex.overflow-x-auto') as HTMLDivElement | null;
    const highlightedElement = cardRefs.current[currentExample] as HTMLDivElement | null;

    if (container && highlightedElement) {
      const containerRect = container.getBoundingClientRect();
      const cardRect = highlightedElement.getBoundingClientRect();
      const scrollLeft =
        highlightedElement.offsetLeft - container.offsetLeft - containerRect.width / 2 + cardRect.width / 2;

      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const checkShouldCenter = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerWidth = container.clientWidth;
    const scrollWidth = container.scrollWidth;

    setShouldCenter(scrollWidth <= containerWidth);
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      threshold: 1,
      rootMargin: '-200px 0px -200px 0px',
    });

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    const handleResize = () => {
      checkShouldCenter();
    };

    window.addEventListener('resize', handleResize);

    checkShouldCenter();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [examples]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isInView && hoveredExample === null) {
      intervalRef.current = setInterval(() => {
        setCurrentExample((prev) => (prev + 1) % examples.length);
      }, 3000);
    }

    scrollToCenter();
  }, [isInView, hoveredExample, currentExample, examples.length]);

  const highlightedIndex = hoveredExample ?? currentExample;

  return (
    <div
      ref={containerRef}
      className='relative w-screen left-1/2 -translate-x-1/2 flex flex-col items-center my-16'
    >
      <h2 className='mb-6 text-lg text-center font-semibold tracking-wide text-muted-foreground'>Used by:</h2>
      <div className='w-full max-w-full overflow-hidden'>
        <div
          ref={scrollContainerRef}
          className={`flex overflow-x-auto scroll-smooth pb-10 no-scrollbar snap-x gap-4 px-4 ${
            shouldCenter ? 'justify-center' : ''
          }`}
        >
          {examples.map((example, index) => (
            <Card
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className='flex-shrink-0 overflow-hidden cursor-pointer w-[280px] sm:w-[320px] md:w-[350px]'
              variant={index === highlightedIndex ? 'default' : 'faded'}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
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
