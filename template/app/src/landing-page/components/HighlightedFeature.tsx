import { cn } from '../../lib/utils';

interface FeatureProps {
  name: string;
  description: string | React.ReactNode;
  direction?: 'row' | 'row-reverse';
  highlightedComponent: React.ReactNode;
  tilt?: 'left' | 'right';
}

/**
 * A component that highlights a feature with a description and a highlighted component.
 * Shows text description on one side, and whatever component you want to show on the other side to demonstrate the functionality.
 */
const HighlightedFeature = ({
  name,
  description,
  direction = 'row',
  highlightedComponent,
  tilt,
}: FeatureProps) => {
  const tiltToClass: Record<Required<FeatureProps>['tilt'], string> = {
    left: 'rotate-1',
    right: '-rotate-1',
  };

  return (
    <div
      className={cn(
        'max-w-6xl mx-auto flex flex-col items-center my-50 gap-x-20 gap-y-10 justify-between px-8 md:px-4 transition-all duration-300 ease-in-out',
        direction === 'row' ? 'md:flex-row' : 'md:flex-row-reverse'
      )}
    >
      <div className='flex-col flex-1'>
        <h2 className='text-4xl font-bold mb-2'>{name}</h2>
        {typeof description === 'string' ? (
          <p className='text-muted-foreground'>{description}</p>
        ) : (
          description
        )}
      </div>
      <div
        className={cn(
          'flex flex-1 my-10 transition-transform duration-300 ease-in-out w-full items-center justify-center',
          tilt && tiltToClass[tilt]
        )}
      >
        {highlightedComponent}
      </div>
    </div>
  );
};

export default HighlightedFeature;
