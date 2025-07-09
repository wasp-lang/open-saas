import React from 'react';

/**
 * Example component showing how to use the unified theme system
 * This demonstrates both ShadCN colors and custom theme colors
 */
export const ThemeExample: React.FC = () => {
  return (
    <div className='p-6 space-y-6'>
      <h2 className='text-2xl font-bold text-foreground'>Theme System Example</h2>

      {/* ShadCN Colors */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-foreground'>ShadCN Colors</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='p-4 bg-primary text-primary-foreground rounded-lg'>Primary</div>
          <div className='p-4 bg-secondary text-secondary-foreground rounded-lg'>Secondary</div>
          <div className='p-4 bg-muted text-muted-foreground rounded-lg'>Muted</div>
          <div className='p-4 bg-accent text-accent-foreground rounded-lg'>Accent</div>
          <div className='p-4 bg-destructive text-destructive-foreground rounded-lg'>Destructive</div>
          <div className='p-4 bg-card text-card-foreground border rounded-lg'>Card</div>
          <div className='p-4 bg-popover text-popover-foreground border rounded-lg'>Popover</div>
          <div className='p-4 bg-background text-foreground border rounded-lg'>Background</div>
        </div>
      </div>

      {/* Custom Theme Colors */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-foreground'>Custom Theme Colors</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='p-4 bg-body text-white rounded-lg'>Body</div>
          <div className='p-4 bg-bodydark text-white rounded-lg'>Body Dark</div>
          <div className='p-4 bg-stroke text-foreground rounded-lg'>Stroke</div>
          <div className='p-4 bg-whiten text-foreground rounded-lg'>Whiten</div>
          <div className='p-4 bg-boxdark text-white rounded-lg'>Box Dark</div>
          <div className='p-4 bg-strokedark text-white rounded-lg'>Stroke Dark</div>
        </div>
      </div>

      {/* Meta Colors */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-foreground'>Meta Colors</h3>
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          <div className='p-4 bg-meta-1 text-white rounded-lg'>Meta 1</div>
          <div className='p-4 bg-meta-2 text-foreground rounded-lg'>Meta 2</div>
          <div className='p-4 bg-meta-3 text-white rounded-lg'>Meta 3</div>
          <div className='p-4 bg-meta-4 text-white rounded-lg'>Meta 4</div>
          <div className='p-4 bg-meta-5 text-white rounded-lg'>Meta 5</div>
          <div className='p-4 bg-meta-6 text-white rounded-lg'>Meta 6</div>
          <div className='p-4 bg-meta-7 text-white rounded-lg'>Meta 7</div>
          <div className='p-4 bg-meta-8 text-white rounded-lg'>Meta 8</div>
          <div className='p-4 bg-meta-9 text-foreground rounded-lg'>Meta 9</div>
        </div>
      </div>

      {/* Status Colors */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-foreground'>Status Colors</h3>
        <div className='grid grid-cols-3 gap-4'>
          <div className='p-4 bg-success text-white rounded-lg'>Success</div>
          <div className='p-4 bg-danger text-white rounded-lg'>Danger</div>
          <div className='p-4 bg-warning text-white rounded-lg'>Warning</div>
        </div>
      </div>

      {/* Chart Colors */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-foreground'>Chart Colors</h3>
        <div className='grid grid-cols-5 gap-4'>
          <div className='p-4 bg-chart-1 text-white rounded-lg'>Chart 1</div>
          <div className='p-4 bg-chart-2 text-white rounded-lg'>Chart 2</div>
          <div className='p-4 bg-chart-3 text-white rounded-lg'>Chart 3</div>
          <div className='p-4 bg-chart-4 text-white rounded-lg'>Chart 4</div>
          <div className='p-4 bg-chart-5 text-white rounded-lg'>Chart 5</div>
        </div>
      </div>

      {/* Font Example */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-foreground'>Font Example</h3>
        <div className='space-y-2'>
          <p className='font-satoshi text-foreground'>This text uses the Satoshi font family</p>
          <p className='font-sans text-foreground'>This text uses the system font family</p>
        </div>
      </div>
    </div>
  );
};
