import { cn } from '../../client/cn';

interface FeatureProps {
  name: string;
  description: string | React.ReactNode;
  direction?: 'row' | 'row-reverse';
  highlightedComponent: React.ReactNode;
  rotate?: boolean;
}

const HighlightedFeature = ({
  name,
  description,
  direction = 'row',
  highlightedComponent,
  rotate = true,
}: FeatureProps) => {
  const rotateClass = Math.random() > 0.5 ? 'rotate-1' : '-rotate-1';

  return (
    <div
      className={cn(
        'flex flex-col items-center my-50 gap-x-10 justify-between',
        direction === 'row' ? 'md:flex-row' : 'md:flex-row-reverse'
      )}
    >
      <div className='flex-col flex-1'>
        <h2 className='text-4xl font-bold mb-2'>{name}</h2>
        {typeof description === 'string' ? <p>{description}</p> : description}
      </div>
      <div className={cn('flex-1 my-10', rotate && rotateClass)}>{highlightedComponent}</div>
    </div>
  );
};

export default HighlightedFeature;
