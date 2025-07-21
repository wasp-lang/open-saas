import React from 'react';
import { cn } from '../../client/cn';
import { Card, CardContent, CardDescription, CardTitle } from '../../components/ui/card';
import { Feature } from './Features';
import SectionTitle from './SectionTitle';

export interface GridFeature extends Omit<Feature, 'icon'> {
  icon?: React.ReactNode;
  emoji?: string;
  direction?: 'col' | 'row' | 'col-reverse' | 'row-reverse';
  align?: 'center' | 'left';
  size: 'small' | 'medium' | 'large';
  highlight?: boolean;
}

interface FeaturesGridProps {
  features: GridFeature[];
  className?: string;
}

const FeaturesGrid = ({ features, className = '' }: FeaturesGridProps) => {
  return (
    <div className='flex flex-col gap-4 my-16 md:my-24 lg:my-40' id='features'>
      <SectionTitle title='Other Features' subtitle='And many more!' />
      <div
        className={cn(
          'grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 mx-4 md:mx-6 lg:mx-8 auto-rows-[minmax(140px,auto)]',
          className
        )}
      >
        {features.map((feature) => (
          <FeaturesGridItem key={feature.name + feature.description} {...feature} />
        ))}
      </div>
    </div>
  );
};

function FeaturesGridItem({
  name,
  description,
  icon,
  emoji,
  href,
  direction = 'col',
  align = 'center',
  size = 'medium',
  highlight = false,
}: GridFeature) {
  const gridFeatureSizeToClasses: Record<GridFeature['size'], string> = {
    small: 'col-span-1',
    medium: 'col-span-2 md:col-span-2 lg:col-span-2',
    large: 'col-span-2 md:col-span-2 lg:col-span-2 row-span-2',
  };

  const directionToClass: Record<NonNullable<GridFeature['direction']>, string> = {
    col: 'flex-col',
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const gridFeatureCard = (
    <Card
      className={cn(
        'h-full min-h-[140px] transition-all duration-300 cursor-pointer',
        gridFeatureSizeToClasses[size]
      )}
      variant={highlight ? 'bentoHighlight' : 'bento'}
    >
      <CardContent className='p-4 h-full flex flex-col justify-center items-center'>
        <div
          className={cn(
            'flex items-center gap-3',
            directionToClass[direction],
            align === 'center' ? 'justify-center items-center' : 'justify-start'
          )}
        >
          <div className='flex h-10 w-10 items-center justify-center rounded-lg'>
            {icon ? icon : emoji ? <span className='text-2xl'>{emoji}</span> : null}
          </div>
          <CardTitle className={cn('text-lg', align === 'center' ? 'text-center' : 'text-left')}>
            {name}
          </CardTitle>
        </div>
        <CardDescription
          className={cn(
            'text-xs leading-relaxed',
            direction === 'col' || align === 'center' ? 'text-center' : 'text-left'
          )}
        >
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} target='_blank' rel='noopener noreferrer' className={gridFeatureSizeToClasses[size]}>
        {gridFeatureCard}
      </a>
    );
  }

  return gridFeatureCard;
}

export default FeaturesGrid;
