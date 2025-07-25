import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import openSaasBannerDark from '../../client/static/open-saas-banner-dark.png';
import openSaasBannerLight from '../../client/static/open-saas-banner-light.png';
import { Button } from '../../components/ui/button';

export default function Hero() {
  return (
    <div className='relative pt-14 w-full'>
      <TopGradient />
      <BottomGradient />
      <div className='md:p-24'>
        <div className='mx-auto max-w-8xl px-6 lg:px-8'>
          <div className='lg:mb-18 mx-auto max-w-3xl text-center'>
            <h1 className='text-5xl font-bold text-foreground sm:text-6xl'>
              Some <span className='italic'>cool</span> words about{' '}
              <span className='text-gradient-primary'>your product</span>
            </h1>
            <p className='mt-6 mx-auto max-w-2xl text-lg leading-8 text-muted-foreground'>
              With some more exciting words about your product!
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <Button size='lg' variant='outline' asChild>
                <WaspRouterLink to={routes.PricingPageRoute.to}>Learn More</WaspRouterLink>
              </Button>
              <Button size='lg' variant='default' asChild>
                <WaspRouterLink to={routes.SignupRoute.to}>
                  Get Started <span aria-hidden='true'>→</span>
                </WaspRouterLink>
              </Button>
            </div>
          </div>
          <div className='mt-14 flow-root sm:mt-14'>
            <div className='hidden md:flex m-2 justify-center rounded-xl lg:-m-4 lg:rounded-2xl lg:p-4'>
              <img
                src={openSaasBannerLight}
                alt='App screenshot'
                width={1000}
                height={530}
                loading='lazy'
                className='rounded-md shadow-2xl ring-1 ring-gray-900/10 dark:hidden'
              />
              <img
                src={openSaasBannerDark}
                alt='App screenshot'
                width={1000}
                height={530}
                loading='lazy'
                className='rounded-md shadow-2xl ring-1 ring-gray-900/10 hidden dark:block'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopGradient() {
  return (
    <div
      className='absolute top-0 right-0 -z-10 transform-gpu overflow-hidden w-full blur-3xl sm:top-0'
      aria-hidden='true'
    >
      <div
        className='aspect-[1020/880] w-[70rem] flex-none sm:right-1/4 sm:translate-x-1/2 dark:hidden bg-gradient-to-tr from-amber-400 to-purple-300 opacity-10'
        style={{
          clipPath: 'polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)',
        }}
      />
    </div>
  );
}

function BottomGradient() {
  return (
    <div
      className='absolute inset-x-0 top-[calc(100%-40rem)] sm:top-[calc(100%-65rem)] -z-10 transform-gpu overflow-hidden blur-3xl'
      aria-hidden='true'
    >
      <div
        className='relative aspect-[1020/880] sm:-left-3/4 sm:translate-x-1/4 dark:hidden bg-gradient-to-br from-amber-400 to-purple-300 opacity-10 w-[90rem]'
        style={{
          clipPath: 'ellipse(80% 30% at 80% 50%)',
        }}
      />
    </div>
  );
}
