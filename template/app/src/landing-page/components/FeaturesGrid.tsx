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
  size?: 'small' | 'medium' | 'large';
}

interface FeaturesGridProps {
  features: GridFeature[];
  className?: string;
}

const FeaturesGrid = ({ features, className = '' }: FeaturesGridProps) => {
  return (
    <div className='flex flex-col gap-4 my-16 md:my-24 lg:my-40' id='features'>
      <SectionTitle title='Features' subtitle='These are some of the features of the product.' />
      <div
        className={cn(
          'grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 mx-4 md:mx-6 lg:mx-8 auto-rows-[minmax(140px,auto)]',
          className
        )}
      >
        {features.map((feature, index) => {
          const direction = feature.direction || 'col';
          const align = feature.align || 'center';
          const size = feature.size || 'medium';

          let gridClasses = '';
          if (size === 'small') {
            gridClasses = 'col-span-1';
          } else if (size === 'medium') {
            gridClasses = 'col-span-2 md:col-span-2 lg:col-span-2';
          } else if (size === 'large') {
            gridClasses = 'col-span-2 md:col-span-2 lg:col-span-2 row-span-2';
          }

          const cardContent = (
            <Card
              className='h-full min-h-[140px] transition-all duration-300 hover:shadow-lg cursor-pointer'
              variant='bento'
            >
              <CardContent className='p-4 h-full flex flex-col justify-center items-center'>
                <div
                  className={cn(
                    'flex items-center gap-3',
                    direction.includes('row') ? 'flex-row' : 'flex-col',
                    direction === 'row-reverse'
                      ? 'flex-row-reverse'
                      : direction === 'col-reverse'
                        ? 'flex-col-reverse'
                        : '',
                    align === 'center' ? 'justify-center items-center' : 'justify-start'
                  )}
                >
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg'>
                    {feature.emoji ? (
                      <span className='text-2xl'>{feature.emoji}</span>
                    ) : feature.icon ? (
                      feature.icon
                    ) : null}
                  </div>
                  <CardTitle className={cn(align === 'center' ? 'text-center' : 'text-left')}>
                    {feature.name}
                  </CardTitle>
                </div>
                <CardDescription
                  className={cn(
                    'text-xs leading-relaxed',
                    direction === 'col' || align === 'center' ? 'text-center' : 'text-left'
                  )}
                >
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          );

          return feature.href ? (
            <a
              key={feature.name}
              href={feature.href}
              target='_blank'
              rel='noopener noreferrer'
              className={cn('block', gridClasses)}
            >
              {cardContent}
            </a>
          ) : (
            <div key={feature.name} className={gridClasses}>
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesGrid;
