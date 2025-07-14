import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';

interface ExampleApp {
  name: string;
  description: string;
  imageSrc: string;
}

/**
 * Horizontally scrollable carousel of example apps.
 *
 * @param examples - The examples to display in the carousel.
 * @returns A carousel of examples.
 */
const ExamplesCarousel = ({ examples }: { examples: ExampleApp[] }) => {
  const [currentExample, setCurrentExample] = useState(Math.floor(examples.length / 2 - 1));
  const [hoveredExample, setHoveredExample] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseEnter = (index: number) => {
    setHoveredExample(index);
  };

  const handleNext = () => {
    setCurrentExample((prev) => (prev + 1) % examples.length);
  };

  useEffect(() => {
    const interval = setInterval(handleNext, 3000);
    return () => clearInterval(interval);
  }, [handleNext]);

  const highlightedIndex = hoveredExample ?? currentExample;

  useEffect(() => {
    const highlightedElement = cardRefs.current[currentExample];

    if (highlightedElement && !hoveredExample) {
      highlightedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentExample, hoveredExample]);

  return (
    <div className='flex flex-col items-center my-10'>
      <h2 className='mb-6 text-center font-semibold tracking-wide text-muted-foreground'>Used by:</h2>
      <div className='flex overflow-y-visible overflow-x-auto scroll-smooth pb-10 no-scrollbar snap-x'>
        {examples.map((example, index) => (
          <Card
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            className='flex-shrink-0 overflow-hidden'
            variant={index === highlightedIndex ? 'default' : 'faded'}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => setHoveredExample(null)}
          >
            <CardContent className='p-0'>
              <img src={example.imageSrc} alt={example.name} className='w-100 h-auto aspect-video' />
              <div className='p-4'>
                <h3 className='text-lg font-bold'>{example.name}</h3>
                <p className='text-sm'>{example.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExamplesCarousel;
