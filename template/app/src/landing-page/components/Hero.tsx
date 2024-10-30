import openSaasBannerWebp from '../../client/static/open-saas-banner.webp';
import { DocsUrl } from '../../shared/common';

export default function Hero() {
  return (
    <div className='relative pt-14 w-full'>
      {/* <BackgroundGradient1 />
      <BackgroundGradient2 /> */}

      <div className='py-24 sm:py-32'>
        <div className='mx-auto max-w-8xl px-6 lg:px-8'>
          <div className='lg:mb-18 mx-auto max-w-3xl text-center'>
            <h1 className='text-4xl font-bold text-gray-900 sm:text-6xl dark:text-white'>
              Some <span className='italic'>cool</span> words about your product
            </h1>
            <p className='mt-6 mx-auto max-w-2xl text-lg leading-8 text-gray-600 dark:text-white'>
              With some more exciting words about your product!
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <a
                href={DocsUrl}
                className='rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:ring-2 hover:ring-yellow-300 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-white'
              >
                Get Started <span aria-hidden='true'>→</span>
              </a>
            </div>
          </div>
          <div className='mt-14 flow-root sm:mt-14'>
            <div className='-m-2  flex justify-center rounded-xl lg:-m-4 lg:rounded-2xl lg:p-4'>
              <img
                src={openSaasBannerWebp}
                alt='App screenshot'
                width={1000}
                height={530}
                loading='lazy'
                decoding='async'
                className='rounded-md shadow-2xl ring-1 ring-gray-900/10'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

