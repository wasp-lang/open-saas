import { cn } from '../../client/cn';

interface FeatureProps {
  name: string;
  description: string | React.ReactNode;
  direction?: 'row' | 'row-reverse';
  highlightedComponent: React.ReactNode;
  rotate?: boolean;
}

/**
 * A component that highlights a feature with a description and a highlighted component.
 * Shows text description on one side, and whatever component you want to show on the other side to demonstrate the functionality.
 *
 * @example
 * <HighlightedFeature
 *   name="Feature Name"
 *   description="Feature description"
 *   direction="row" // or "row-reverse"
 *   highlightedComponent={<div>Highlighted Component</div>}
 *   rotate={true} // or false
 * />
 * @param name - The name of the feature.
 * @param description - The description of the feature.
 * @param direction - The direction of the feature.
 * @param highlightedComponent - The component to highlight.
 * @param rotate - Whether to rotate the highlighted component.
 */
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
        'flex flex-col items-center my-50 gap-x-20 justify-between px-8 md:px-0',
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
        className={cn('flex-1 my-10 transition-transform duration-300 ease-in-out', rotate && rotateClass)}
      >
        {highlightedComponent}
      </div>
    </div>
  );
};

export default HighlightedFeature;
