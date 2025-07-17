import React from 'react';
import { cn } from '../../client/cn';
import { Card, CardContent, CardDescription, CardTitle } from '../../components/ui/card';
import { Feature } from './Features';
import SectionTitle from './SectionTitle';

export interface GridFeature extends Omit<Feature, 'icon'> {
  icon: string | React.ReactNode;
  direction?: 'col' | 'row' | 'col-reverse' | 'row-reverse';
  align?: 'center' | 'left';import React from 'react';
  import { cn } from '../../client/cn';
  import { Card, CardContent, CardDescription, CardTitle } from '../../components/ui/card';
  import { Feature } from './Features';
  import SectionTitle from './SectionTitle';
  
  export interface GridFeature extends Omit<Feature, 'icon'> {
    icon: string | React.ReactNode;
    direction?: 'col' | 'row' | 'col-reverse' | 'row-reverse';
    align?: 'center' | 'left';
    span?: number;
  }
  
  interface FeaturesGridProps {
    features: GridFeature[];
    className?: string;
  }
  
  const FeaturesGrid = ({ features, className = '' }: FeaturesGridProps) => {
    return (
      <div className='flex flex-col gap-4 my-16 md:my-24 lg:my-40'>
        <SectionTitle title='Other Features' subtitle='And many more!' />
        <div
          className={cn(
            'grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 mx-4 md:mx-6 lg:mx-8 auto-rows-[minmax(140px,auto)]',
            className
          )}
        >
          {features.map((feature, index) => {
            const direction = feature.direction || 'col';
            const align = feature.align || 'center';
            const span = feature.span || 1;
  
            let gridClasses = '';
            if (span < 1) {
              gridClasses = 'col-span-1';
            } else if (span === 1) {
              gridClasses = 'col-span-2 md:col-span-2 lg:col-span-2';
            } else if (span > 1) {
              gridClasses = 'col-span-2 md:col-span-2 lg:col-span-2 row-span-2';
            }
  
            return (
              <Card
                key={feature.name}
                className={cn(
                  'h-full min-h-[140px] transition-all duration-300 hover:shadow-lg cursor-pointer',
                  gridClasses
                )}
                variant='bento'
                onClick={() => {
                  if (feature.href) {
                    window.open(feature.href, '_blank');
                  }
                }}
              >
                <CardContent className='p-4 h-full flex flex-col justify-center items-center'>
                  <div
                    className={cn(
                      'flex items-center gap-3',
                      direction === 'row' || direction === 'row-reverse' ? 'flex-row' : 'flex-col',
                      direction === 'col-reverse' || direction === 'row-reverse' ? 'flex-col-reverse' : '',
                      align === 'center' ? 'justify-center items-center' : 'justify-start'
                    )}
                  >
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg'>
                      {typeof feature.icon === 'string' ? (
                        <span className='text-2xl'>{feature.icon}</span>
                      ) : (
                        feature.icon
                      )}
                    </div>
                    <CardTitle
                      className={cn('text-lg font-semibold', align === 'center' ? 'text-center' : 'text-left')}
                    >
                      {feature.name}
                    </CardTitle>
                  </div>
                  <CardDescription
                    className={cn(
                      'text-base leading-relaxed',
                      direction === 'col' ? 'text-center' : align === 'center' ? 'text-center' : 'text-left'
                    )}
                  >
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };
  
  export default FeaturesGrid;
  
  span?: number;
}

interface FeaturesGridProps {
  features: GridFeature[];
  className?: string;
}

const FeaturesGrid = ({ features, className = '' }: FeaturesGridProps) => {
  return (
    <div className='flex flex-col gap-4 my-16 md:my-24 lg:my-40'>
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
          const span = feature.span || 1;

          let gridClasses = '';
          if (span < 1) {
            gridClasses = 'col-span-1';
          } else if (span === 1) {
            gridClasses = 'col-span-2 md:col-span-2 lg:col-span-2';
          } else if (span > 1) {
            gridClasses = 'col-span-2 md:col-span-2 lg:col-span-2 row-span-2';
          }

          return (
            <Card
              key={feature.name}
              className={cn(
                'h-full min-h-[140px] transition-all duration-300 hover:shadow-lg cursor-pointer',
                gridClasses
              )}
              variant='bento'
              onClick={() => {
                if (feature.href) {
                  window.open(feature.href, '_blank');
                }
              }}
            >
              <CardContent className='p-4 h-full flex flex-col justify-center items-center'>
                <div
                  className={cn(
                    'flex items-center gap-3',
                    direction === 'row' || direction === 'row-reverse' ? 'flex-row' : 'flex-col',
                    direction === 'col-reverse' || direction === 'row-reverse' ? 'flex-col-reverse' : '',
                    align === 'center' ? 'justify-center items-center' : 'justify-start'
                  )}
                >
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg'>
                    {typeof feature.icon === 'string' ? (
                      <span className='text-2xl'>{feature.icon}</span>
                    ) : (
                      feature.icon
                    )}
                  </div>
                  <CardTitle
                    className={cn('text-lg font-semibold', align === 'center' ? 'text-center' : 'text-left')}
                  >
                    {feature.name}
                  </CardTitle>
                </div>
                <CardDescription
                  className={cn(
                    'text-base leading-relaxed',
                    direction === 'col' ? 'text-center' : align === 'center' ? 'text-center' : 'text-left'
                  )}
                >
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturesGrid;
