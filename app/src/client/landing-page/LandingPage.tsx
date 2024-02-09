import { Link } from "wasp/client/router";
import { useAuth } from "wasp/client/auth";
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { AiFillCloseCircle, AiFillGithub } from 'react-icons/ai';
import { HiBars3 } from 'react-icons/hi2';
import { BiLogIn } from 'react-icons/bi';
import logo from '../static/logo.png';
import {
  features,
  navigation,
  faqs,
  footerNavigation,
  testimonials,
} from './contentSections';
import DropdownUser from '../components/DropdownUser';
import { DOCS_URL, GITHUB_URL } from '../../shared/constants';
import { UserMenuItems } from '../components/UserMenuItems';
import DarkModeSwitcher from '../admin/components/DarkModeSwitcher';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [repoInfo, setRepoInfo] = useState<null | any>(null);
 
  const { data: user, isLoading: isUserLoading } = useAuth();

  useEffect(() => {
    const fetchRepoInfo = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/wasp-lang/open-saas'
        );
        const data = await response.json();
        setRepoInfo(data);
      } catch (error) {
        console.error('Error fetching repo info', error);
      }
    };
    fetchRepoInfo();
  }, []);

  const NavLogo = () => (
    <img className='h-8 w-8' src={logo} alt='Open SaaS App' />
  );

  return (
    <div className='bg-white dark:text-white dark:bg-boxdark-2'>
      {/* Header */}
      <header className='absolute inset-x-0 top-0 z-50 dark:bg-boxdark-2'>
        <nav
          className='flex items-center justify-between p-6 lg:px-8'
          aria-label='Global'
        >
          <div className='flex items-center lg:flex-1'>
            <a
              href='/'
              className='flex items-center -m-1.5 p-1.5 text-gray-900 duration-300 ease-in-out hover:text-yellow-500 dark:text-white '
            >
              <NavLogo />
              <span className='ml-2 text-sm font-semibold leading-6 dark:text-white'>
                Open Saas
              </span>
            </a>
          </div>
          <div className='flex lg:hidden'>
            <button
              type='button'
              className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-white'
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className='sr-only'>Open main menu</span>
              <HiBars3 className='h-6 w-6' aria-hidden='true' />
            </button>
          </div>
          <div className='hidden lg:flex lg:gap-x-12'>
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className='text-sm font-semibold leading-6 text-gray-900 duration-300 ease-in-out hover:text-yellow-500 dark:text-white'
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className='hidden lg:flex lg:flex-1 lg:justify-end lg:align-end'>
            {/* <!-- Dark Mode Toggler --> */}
            <div className='flex items-center gap-3 text-sm font-semibold leading-6 2xsm:gap-7'>
              <ul className='flex justify-center items-center gap-2 2xsm:gap-4'>
                <DarkModeSwitcher />
              </ul>
              {isUserLoading ? null : !user ? (
                <Link to='/login'>
                  <div className='flex justify-end items-center duration-300 ease-in-out text-gray-900 text-sm hover:text-yellow-500 dark:text-white'>
                    Try the Demo App <BiLogIn size='1.1rem' className='ml-1' />
                  </div>
                </Link>
              ) : (
                <DropdownUser user={user} />
              )}
            </div>
          </div>
        </nav>
        <Dialog
          as='div'
          className='lg:hidden'
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className='fixed inset-0 z-50' />
          <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-boxdark dark:text-white'>
            <div className='flex items-center justify-between'>
              <a href='/' className='-m-1.5 p-1.5'>
                <span className='sr-only'>Open SaaS</span>
                <NavLogo />
              </a>
              <button
                type='button'
                className='-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-50'
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className='sr-only'>Close menu</span>
                <AiFillCloseCircle className='h-6 w-6' aria-hidden='true' />
              </button>
            </div>
            <div className='mt-6 flow-root'>
              <div className='-my-6 divide-y divide-gray-500/10'>
                <div className='space-y-2 py-6'>
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-boxdark-2'
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className='py-6'>
                  {isUserLoading ? null : !user ? (
                    <Link to='/login'>
                      <div className='flex justify-end items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500 dark:text-white'>
                        Try the Demo App{' '}
                        <BiLogIn size='1.1rem' className='ml-1' />
                      </div>
                    </Link>
                  ) : (
                    <UserMenuItems user={user} />
                  )}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>

      <main className='isolate dark:bg-boxdark-2'>
        {/* Hero section */}
        <div className='relative pt-14 w-full '>
          <div
            className='absolute top-0 right-0 -z-10 transform-gpu overflow-hidden w-full blur-3xl sm:top-0 '
            aria-hidden='true'
          >
            <div
              className='aspect-[1020/880] w-[55rem] flex-none sm:right-1/4 sm:translate-x-1/2 dark:hidden bg-gradient-to-tr from-amber-400 to-purple-300 opacity-40'
              style={{
                clipPath:
                  'polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)',
              }}
            />
          </div>
          <div
            className='absolute inset-x-0 top-[calc(100%-40rem)] sm:top-[calc(100%-65rem)] -z-10 transform-gpu overflow-hidden blur-3xl'
            aria-hidden='true'
          >
            <div
              className='relative aspect-[1020/880] sm:-left-3/4 sm:translate-x-1/4 dark:hidden bg-gradient-to-br from-amber-400 to-purple-300  opacity-50 w-[72.1875rem]'
              style={{
                clipPath: 'ellipse(80% 30% at 80% 50%)',
              }}
            />
          </div>
          <div className='py-24 sm:py-32'>
            <div className='mx-auto max-w-8xl px-6 lg:px-8'>
              <div className='lg:mb-18 mx-auto max-w-3xl text-center'>
                <h1 className='text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl'>
                  The <span className='italic'>free</span> SaaS template with
                  superpowers
                </h1>
                <p className='mt-6 mx-auto max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400'>
                  An open-source, feature-rich, full-stack React + NodeJS
                  template that manages features for you.
                </p>
                <div className='mt-10 flex items-center justify-center gap-x-6'>
                  <a
                    href={DOCS_URL}
                    className='rounded-md px-6 py-4 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:ring-2 hover:ring-yellow-300 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-white'
                  >
                    Get Started <span aria-hidden='true'>→</span>
                  </a>
                  <a
                    href={GITHUB_URL}
                    className='group relative flex items-center justify-center rounded-md bg-gray-100 px-6 py-4 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-200 dark:bg-gray-700 hover:ring-2 hover:ring-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                  >
                    {/* <AiFillGithub size='1.25rem' className='mr-2' /> */}
                    View the Repo
                    {repoInfo!! && (
                      <>
                        <span className='absolute -top-3 -right-7 inline-flex items-center gap-x-1 rounded-full ring-1 group-hover:ring-2 ring-inset ring-yellow-300 bg-yellow-100 px-2 py-1 text-sm font-medium text-yellow-800'>
                          <AiFillGithub size='1rem' />
                          {repoInfo.stargazers_count}
                        </span>
                      </>
                    )}
                  </a>
                </div>
              </div>
              <div className='mt-14 flow-root sm:mt-14 '>
                <div className='-m-2 mx-auto rounded-xl lg:-m-4 lg:rounded-2xl lg:p-4'>
                  {/* <img
                    src={openSaasBanner}
                    alt='App screenshot'
                    width={2432}
                    height={1442}
                    className='rounded-md shadow-2xl ring-1 ring-gray-900/10'
                  /> */}
                  <iframe
                    className=' mx-auto w-full md:w-[85%] aspect-[4/3] shadow-2xl'
                    src='https://cards.producthunt.com/cards/posts/436467?v=1'
                    // width={850}
                    // height={689}
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo cloud section */}

        <div className='mt-12 mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-between gap-y-6'>
          <h2 className='mb-6 text-center font-semibold tracking-wide text-gray-500'>
            Built and Ships with
          </h2>

          <div className='mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-12 sm:max-w-xl md:grid-cols-4 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none'>
            <img
              className=' col-span-1 max-h-12 w-full object-contain grayscale opacity-100'
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png'
              alt='React'
              height={48}
            />
            <img
              className='col-span-1 max-h-12 w-full object-contain grayscale opacity-60 dark:filter dark:brightness-0 dark:invert'
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/590px-Node.js_logo.svg.png'
              alt='NodeJS'
              height={48}
            />
            <img
              className='col-span-1 max-h-12 w-full object-contain grayscale opacity-80'
              src={logo}
              alt='Wasp'
              height={48}
            />
            <div className='flex justify-center col-span-1 max-h-12 w-full object-contain grayscale opacity-80'>
              <svg
                width={48}
                height={48}
                viewBox='0 0 32 32'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  className='dark:fill-white'
                  fill='#545454'
                  d='M25.21,24.21,12.739,27.928a.525.525,0,0,1-.667-.606L16.528,5.811a.43.43,0,0,1,.809-.094l8.249,17.661A.6.6,0,0,1,25.21,24.21Zm2.139-.878L17.8,2.883h0A1.531,1.531,0,0,0,16.491,2a1.513,1.513,0,0,0-1.4.729L4.736,19.648a1.592,1.592,0,0,0,.018,1.7l5.064,7.909a1.628,1.628,0,0,0,1.83.678l14.7-4.383a1.6,1.6,0,0,0,1-2.218Z'
                />
              </svg>
            </div>
            <img
              className='col-span-1 max-h-12 w-full object-contain grayscale '
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/512px-Tailwind_CSS_Logo.svg.png'
              alt='Tailwind CSS'
              height={48}
            />
            <img
              className='col-span-1 max-h-12 w-full object-contain grayscale opacity-80 dark:opacity-60 dark:filter dark:brightness-0 dark:invert'
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png'
              alt='Stripe'
              height={48}
            />
            <div className='flex justify-center col-span-1 w-full max-h-12 object-contain grayscale opacity-75'>
              <svg viewBox='0 0 256 370' xmlns='http://www.w3.org/2000/svg'>
                <path
                  className='dark:fill-white'
                  fill='#545454'
                  d='M182.022 9.147c2.982 3.702 4.502 8.697 7.543 18.687L256 246.074a276.467 276.467 0 0 0-79.426-26.891L133.318 73.008a5.63 5.63 0 0 0-10.802.017L79.784 219.11A276.453 276.453 0 0 0 0 246.04L66.76 27.783c3.051-9.972 4.577-14.959 7.559-18.654a24.541 24.541 0 0 1 9.946-7.358C88.67 0 93.885 0 104.314 0h47.683c10.443 0 15.664 0 20.074 1.774a24.545 24.545 0 0 1 9.95 7.373Z'
                />
                <path
                  className='dark:fill-white'
                  fill='#545454'
                  d='M189.972 256.46c-10.952 9.364-32.812 15.751-57.992 15.751-30.904 0-56.807-9.621-63.68-22.56-2.458 7.415-3.009 15.903-3.009 21.324 0 0-1.619 26.623 16.898 45.14 0-9.615 7.795-17.41 17.41-17.41 16.48 0 16.46 14.378 16.446 26.043l-.001 1.041c0 17.705 10.82 32.883 26.21 39.28a35.685 35.685 0 0 1-3.588-15.647c0-16.886 9.913-23.173 21.435-30.48 9.167-5.814 19.353-12.274 26.372-25.232a47.588 47.588 0 0 0 5.742-22.735c0-5.06-.786-9.938-2.243-14.516Z'
                />
              </svg>
            </div>
            <div className='flex justify-center col-span-1 w-full max-h-12 object-contain dark:opacity-80'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                preserveAspectRatio='xMidYMid'
                viewBox='0 0 256 260'
              >
                <path
                  className='dark:fill-white'
                  fill='#545454'
                  d='M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z'
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Feature section */}
        <div id='features' className='mx-auto mt-48 max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <p className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white'>
              <span className='text-yellow-500'>100%</span> Open-Source
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400'>
              No vendor lock-in.
              <br /> Deploy anywhere.
            </p>
          </div>
          <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl'>
            <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16'>
              {features.map((feature) => (
                <a href={feature.href} className='group'>
                  <div key={feature.name} className='relative pl-16'>
                    <dt className='text-base font-semibold leading-7 text-gray-900 dark:text-white group-hover:underline'>
                      <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center border border-yellow-400 bg-yellow-100/50 dark:bg-boxdark rounded-lg group-hover:border-yellow-500'>
                        <div className='text-2xl group-hover:opacity-80 '>
                          {feature.icon}
                        </div>
                      </div>
                      {feature.name}
                    </dt>
                    <dd className='mt-2 text-base leading-7 text-gray-600 dark:text-gray-400'>
                      {feature.description}
                    </dd>
                  </div>
                </a>
              ))}
            </dl>
          </div>
        </div>

        {/* Testimonial section */}
        <div className='mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8'>
          <div className='relative sm:left-5 -m-2 rounded-xl bg-yellow-400/20 lg:ring-1 lg:ring-yellow-500/50 lg:-m-4 '>
            <div className='relative sm:top-5 sm:right-5 bg-gray-900 dark:bg-boxdark px-8 py-20 shadow-xl sm:rounded-xl sm:px-10 sm:py-16 md:px-12 lg:px-20'>
              <h2 className='text-left text-xl font-semibold tracking-wide leading-7 text-gray-500 dark:text-white'>
                What Our Users Say
              </h2>
              <div className='relative flex flex-wrap gap-6 w-full mt-6 z-10 justify-between lg:mx-0'>
                {testimonials.map((testimonial) => (
                  <figure className='w-full lg:w-1/4 box-content flex flex-col justify-between p-8 rounded-xl bg-gray-500/5 '>
                    <blockquote className='text-lg text-white sm:text-md sm:leading-8'>
                      <p>{testimonial.quote}</p>
                    </blockquote>
                    <figcaption className='mt-6 text-base text-white'>
                      <a
                        href={testimonial.socialUrl}
                        className='flex items-center gap-x-2'
                      >
                        <img
                          src={testimonial.avatarSrc}
                          className='h-12 w-12 rounded-full'
                        />
                        <div>
                          <div className='font-semibold hover:underline'>
                            {testimonial.name}
                          </div>
                          <div className='mt-1'>{testimonial.role}</div>
                        </div>
                      </a>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className='mt-32 mx-auto max-w-2xl divide-y divide-gray-900/10 px-6 pb-8 sm:pb-24 sm:pt-12 lg:max-w-7xl lg:px-8 lg:py-32'>
          <h2 className='text-2xl font-bold leading-10 tracking-tight text-gray-900 dark:text-white'>
            Frequently asked questions
          </h2>
          <dl className='mt-10 space-y-8 divide-y divide-gray-900/10 dark:divide-gray-100/10'>
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className='pt-8 lg:grid lg:grid-cols-12 lg:gap-8'
              >
                <dt className='text-base font-semibold leading-7 text-gray-900 dark:text-white lg:col-span-5'>
                  {faq.question}
                </dt>
                <dd className='mt-4 lg:col-span-7 lg:mt-0'>
                  <p className='text-base leading-7 text-gray-600 dark:text-gray-400'>
                    {faq.answer}
                  </p>
                  {faq.href && (
                    <a
                      href={faq.href}
                      className='mt-4 text-base leading-7 text-yellow-500 hover:text-yellow-600'
                    >
                      Learn more →
                    </a>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </main>

      {/* Footer */}
      <div className='mx-auto mt-6 max-w-7xl px-6 lg:px-8 dark:bg-boxdark-2'>
        <footer
          aria-labelledby='footer-heading'
          className='relative border-t border-gray-900/10 dark:border-gray-100/10 py-24 sm:mt-32'
        >
          <h2 id='footer-heading' className='sr-only'>
            Footer
          </h2>
          <div className='flex items-start justify-end mt-10 gap-20'>
            <div>
              <h3 className='text-sm font-semibold leading-6 text-gray-900 dark:text-white'>
                App
              </h3>
              <ul role='list' className='mt-6 space-y-4'>
                {footerNavigation.app.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className='text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-white'
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className='text-sm font-semibold leading-6 text-gray-900 dark:text-white'>
                Company
              </h3>
              <ul role='list' className='mt-6 space-y-4'>
                {footerNavigation.company.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className='text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-white'
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
