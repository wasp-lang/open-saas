import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai';
import { HiBars3 } from 'react-icons/hi2';
import { BiLogIn } from 'react-icons/bi';
import { Link } from '@wasp/router';
import logo from '../static/logo.png';
import daBoi from '../static/da-boi.png';
import openSaasBanner from '../static/open-saas-banner-gr.png';
import { features, navigation, tiers, faqs, footerNavigation } from './contentSections';
import useAuth from '@wasp/auth/useAuth';
import DropdownUser from '../components/DropdownUser';
import { useHistory } from 'react-router-dom';
import stripePayment from '@wasp/actions/stripePayment';
import { DOCS_URL, STRIPE_CUSTOMER_PORTAL_LINK } from '@wasp/shared/constants';
import { UserMenuItems } from '../components/UserMenuItems';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStripePaymentLoading, setIsStripePaymentLoading] = useState<boolean | string>(false);

  const { data: user, isLoading: isUserLoading } = useAuth();

  const history = useHistory();

  async function handleBuyNowClick(tierId: string) {
    if (!user) {
      history.push('/login');
      return;
    }
    try {
      setIsStripePaymentLoading(tierId);
      let stripeResults = await stripePayment(tierId);

      if (stripeResults?.sessionUrl) {
        window.open(stripeResults.sessionUrl, '_self');
      }
    } catch (error: any) {
      console.error(error?.message ?? 'Something went wrong.');
    } finally {
      setIsStripePaymentLoading(false);
    }
  }

  const NavLogo = () => <img className='h-8 w-8' src={logo} alt='Open SaaS App' />;

  return (
    <div className='bg-white'>
      {/* Header */}
      <header className='absolute inset-x-0 top-0 z-50'>
        <nav className='flex items-center justify-between p-6 lg:px-8' aria-label='Global'>
          <div className='flex lg:flex-1'>
            <a href='/' className='-m-1.5 p-1.5'>
              <NavLogo />
            </a>
          </div>
          <div className='flex lg:hidden'>
            <button
              type='button'
              className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
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
                className='text-sm font-semibold leading-6 text-gray-900 duration-300 ease-in-out hover:text-yellow-500'
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className='hidden lg:flex lg:flex-1 lg:justify-end lg:align-end'>
            <div className='text-sm  font-semibold leading-6 '>
              {isUserLoading ? null : !user ? (
                <Link to='/login'>
                  <div className='flex justify-end items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500'>
                    Log in <BiLogIn size='1.1rem' className='ml-1 mt-[0.1rem]' />
                  </div>
                </Link>
              ) : (
                <DropdownUser user={user} />
              )}
            </div>
          </div>
        </nav>
        <Dialog as='div' className='lg:hidden' open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className='fixed inset-0 z-50' />
          <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
            <div className='flex items-center justify-between'>
              <a href='/' className='-m-1.5 p-1.5'>
                <span className='sr-only'>Open SaaS</span>
                <NavLogo />
              </a>
              <button
                type='button'
                className='-m-2.5 rounded-md p-2.5 text-gray-700'
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
                      className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className='py-6'>
                  {isUserLoading ? null : !user ? (
                    <Link to='/login'>
                      <div className='flex justify-end items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500'>
                        Log in <BiLogIn size='1.1rem' className='ml-1 mt-[0.1rem]' />
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

      <main className='isolate'>
        {/* Hero section */}
        <div className='relative pt-14 w-full '>
          <div
            className='absolute top-0 right-0 -z-10 transform-gpu overflow-hidden w-full blur-3xl sm:top-0 '
            aria-hidden='true'
          >
            <div
              className='aspect-[1020/880] w-[55rem] flex-none bg-gradient-to-tr from-amber-400 to-purple-300 opacity-40 sm:right-1/4 sm:translate-x-1/2'
              style={{
                clipPath: 'polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)',
              }}
            />
          </div>
          <div
            className='absolute inset-x-0 top-[calc(100%-40rem)] sm:top-[calc(100%-65rem)] -z-10 transform-gpu overflow-hidden blur-3xl'
            aria-hidden='true'
          >
            <div
              className='relative aspect-[1020/880] sm:-left-3/4 sm:translate-x-1/4 bg-gradient-to-br from-amber-400 to-purple-300  opacity-50 w-[72.1875rem]'
              style={{
                clipPath: 'ellipse(80% 30% at 80% 50%)',
              }}
            />
          </div>
          <div className='py-24 sm:py-32'>
            <div className='mx-auto max-w-8xl px-6 lg:px-8'>
              <div className='lg:mb-18 mx-auto max-w-2xl text-center'>
                <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
                  The <span className='italic'>free</span> SaaS template with superpowers
                </h1>
                <p className='mt-6 text-lg leading-8 text-gray-600'>
                  An open-source, feature-rich template, engineered with Wasp—the only full-stack React + NodeJS
                  framework that manages features for you.
                </p>
                <div className='mt-10 flex items-center justify-center gap-x-6'>
                  <a
                    href='https://github.com/wasp-lang/open-saas'
                    className='rounded-md bg-yellow-500 px-3.5 py-2.5 text-sm font-semibold text-white hover:text-white shadow-sm hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                  >
                    Get Started <span aria-hidden='true'>→</span>
                  </a>
                  <a
                    href={DOCS_URL}
                    className='rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:ring-2 hover:ring-purple-200 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                  >
                    Read the Docs
                  </a>
                </div>
              </div>
              <div className='mt-14 flow-root sm:mt-14 '>
                <div className='-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4'>
                  <img
                    src={openSaasBanner}
                    alt='App screenshot'
                    width={2432}
                    height={1442}
                    className='rounded-md shadow-2xl ring-1 ring-gray-900/10'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logo cloud section */}

        <div className='mt-12 mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-between gap-y-6'>
          <h2 className='mb-6 text-center font-semibold tracking-wide text-gray-500'>Built and Ships with</h2>

          <div className='mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-12 sm:max-w-xl md:grid-cols-5 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:grid-cols-5'>
            <img
              className=' col-span-1 max-h-12 w-full object-contain grayscale opacity-100'
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png'
              alt='React'
              height={48}
            />
            <img
              className=' col-span-1 max-h-12 w-full object-contain grayscale opacity-70 '
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/590px-Node.js_logo.svg.png'
              alt='NodeJS'
              height={48}
            />
            <img
              className='col-span-2 md:col-span-1 max-h-12 w-full object-contain grayscale opacity-80 '
              src={logo}
              alt='Wasp'
              height={48}
            />
            <img
              className=' col-span-1 max-h-12 w-full object-contain grayscale '
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/512px-Tailwind_CSS_Logo.svg.png'
              alt='Tailwind CSS'
              height={48}
            />
            <img
              className=' col-span-1 max-h-12 w-full object-contain grayscale opacity-80 '
              src='https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/512px-Stripe_Logo%2C_revised_2016.svg.png'
              alt='Stripe'
              height={48}
            />
          </div>
        </div>

        {/* Feature section */}
        <div id='features' className='mx-auto mt-48 max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <p className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
              All the important <span className='text-yellow-500'>stuff</span>
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600'>
              We've pre-built the important stuff.
              <br /> Wasp does all the boring stuff.
              <br /> You get all the credit.
            </p>
          </div>
          <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl'>
            <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16'>
              {features.map((feature) => (
                <div key={feature.name} className='relative pl-16'>
                  <dt className='text-base font-semibold leading-7 text-gray-900'>
                    <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center border border-yellow-400 bg-yellow-100/50 rounded-lg'>
                      {/* <feature.icon className='h-6 w-6 text-white' aria-hidden='true' /> */}
                      <div className='text-2xl'>{feature.icon}</div>
                    </div>
                    {feature.name}
                  </dt>
                  <dd className='mt-2 text-base leading-7 text-gray-600'>{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Testimonial section */}
        <div className='mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8'>
          <div className='relative sm:left-5 -m-2 rounded-xl bg-yellow-400/20 lg:ring-1 lg:ring-yellow-500/50 lg:-m-4 '>
            <div className='relative sm:top-5 sm:right-5 bg-gray-900 px-8 py-20 shadow-xl sm:rounded-xl sm:px-10 sm:py-16 md:px-12 lg:px-20'>
              <h2 className='text-left font-semibold tracking-wide  leading-7 text-gray-500'>Testimonials</h2>
              <div className='relative flex flex-col lg:flex-row gap-12 w-full mt-6 z-10 justify-between lg:mx-0'>
                <figure className='flex-1 flex-1 flex flex-col justify-between p-8 rounded-xl bg-gray-500/5 '>
                  <blockquote className='text-lg font-semibold text-white sm:text-xl sm:leading-8'>
                    <p>
                      “I used Wasp to build and sell my AI-augmented SaaS app for marketplace vendors within two
                      months!”
                    </p>
                  </blockquote>
                  <figcaption className='mt-6 text-base text-white'>
                    <a href='https://twitter.com/maksim36ua' className='flex items-center gap-x-2'>
                      <img
                        src='https://pbs.twimg.com/profile_images/1719397191205179392/V_QrGPSO_400x400.jpg'
                        className='h-12 w-12 rounded-full'
                      />
                      <div>
                        <div className='font-semibold hover:underline'>Maks</div>
                        <div className='mt-1'>Senior Eng @ Red Hat</div>
                      </div>
                    </a>
                  </figcaption>
                </figure>
                <figure className='flex-1 flex flex-col justify-between p-8 rounded-xl bg-gray-500/5 '>
                  <blockquote className='text-lg font-semibold text-white sm:text-xl sm:leading-8'>
                    <p>“My cats love it!”</p>
                  </blockquote>
                  <figcaption className='mt-6 text-base text-white'>
                    <a href='https://twitter.com/webrickony' className='flex items-center gap-x-2'>
                      <img
                        src='https://pbs.twimg.com/profile_images/1560677466749943810/QIFuQMqU_400x400.jpg'
                        className='h-12 w-12 rounded-full'
                      />
                      <div>
                        <div className='font-semibold hover:underline'>Fecony</div>
                        <div className='mt-1'>Wasp Expert</div>
                      </div>
                    </a>
                  </figcaption>
                </figure>
                <figure className='flex-1 flex-1 flex flex-col justify-between  p-8 rounded-xl bg-gray-500/5 '>
                  <blockquote className='text-lg font-semibold text-white sm:text-xl sm:leading-8'>
                    <p>“I don't even know how to code. I'm just a plushie.”</p>
                  </blockquote>
                  <figcaption className=' mt-6 text-base text-white'>
                    <a href='https://twitter.com/wasp-lang' className='flex items-center gap-x-2'>
                      <img src={daBoi} className='h-14 w-14 rounded-full' />
                      <div>
                        <div className='font-semibold hover:underline'>Da Boi</div>
                        <div className='mt-1'>Wasp Unofficial Mascot</div>
                      </div>
                    </a>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing section */}
        <div className='py-24 sm:pt-48'>
          <div className='mx-auto max-w-7xl px-6 lg:px-8'>
            <div id='pricing' className='mx-auto max-w-4xl text-center'>
              <h2 className='mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
                Pick your <span className='text-yellow-500'>pricing</span>
              </h2>
            </div>
            <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600'>
              Secure Stripe webhooks, and a complete subscription management system are built-in. Just add your Stripe
              Product IDs and you're good to go!
            </p>
            <div className='isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 lg:gap-x-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3'>
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative flex flex-col  ${
                    tier.bestDeal ? 'ring-2' : 'ring-1 lg:mt-8'
                  } grow justify-between rounded-3xl ring-gray-200 overflow-hidden p-8 xl:p-10`}
                >
                  {tier.bestDeal && (
                    <div
                      className='absolute top-0 right-0 -z-10 w-full h-full transform-gpu blur-3xl'
                      aria-hidden='true'
                    >
                      <div
                        className='absolute w-full h-full bg-gradient-to-br from-amber-400 to-purple-300 opacity-30'
                        style={{
                          clipPath: 'circle(670% at 50% 50%)',
                        }}
                      />
                    </div>
                  )}
                  <div className='mb-8'>
                    <div className='flex items-center justify-between gap-x-4'>
                      <h3 id={tier.id} className='text-gray-900 text-lg font-semibold leading-8'>
                        {tier.name}
                      </h3>
                    </div>
                    <p className='mt-4 text-sm leading-6 text-gray-600'>{tier.description}</p>
                    <p className='mt-6 flex items-baseline gap-x-1'>
                      <span className='text-4xl font-bold tracking-tight text-gray-900'>{tier.priceMonthly}</span>
                      <span className='text-sm font-semibold leading-6 text-gray-600'>/month</span>
                    </p>
                    <ul role='list' className='mt-8 space-y-3 text-sm leading-6 text-gray-600'>
                      {tier.features.map((feature) => (
                        <li key={feature} className='flex gap-x-3'>
                          <AiFillCheckCircle className='h-6 w-5 flex-none text-yellow-500' aria-hidden='true' />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {!!user && user.hasPaid ? (
                    <a
                      href={STRIPE_CUSTOMER_PORTAL_LINK}
                      aria-describedby='manage-subscription'
                      className={`
                      ${tier.id === 'enterprise-tier' ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
                      ${
                        tier.bestDeal
                          ? 'bg-yellow-500 text-white hover:text-white shadow-sm hover:bg-yellow-400'
                          : 'text-gray-600  ring-1 ring-inset ring-purple-200 hover:ring-purple-400'
                      }
                      'mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400'
                    `}
                    >
                      {tier.id === 'enterprise-tier' ? 'Contact us' : 'Manage Subscription'}
                    </a>
                  ) : (
                    <button
                      onClick={() => handleBuyNowClick(tier.id)}
                      aria-describedby={tier.id}
                      className={`
                      ${tier.id === 'enterprise-tier' ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
                      ${
                        tier.bestDeal
                          ? 'bg-yellow-500 text-white hover:text-white shadow-sm hover:bg-yellow-400'
                          : 'text-gray-600  ring-1 ring-inset ring-purple-200 hover:ring-purple-400'
                      }
                      ${isStripePaymentLoading === tier.id ? 'cursor-wait' : null}
                      'mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400'
                    `}
                    >
                      {tier.id === 'enterprise-tier' ? 'Contact us' : !!user ? 'Buy plan' : 'Log in to buy plan'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className='mx-auto max-w-2xl divide-y divide-gray-900/10 px-6 pb-8 sm:pb-24 sm:pt-12 lg:max-w-7xl lg:px-8 lg:pb-32'>
          <h2 className='text-2xl font-bold leading-10 tracking-tight text-gray-900'>Frequently asked questions</h2>
          <dl className='mt-10 space-y-8 divide-y divide-gray-900/10'>
            {faqs.map((faq) => (
              <div key={faq.id} className='pt-8 lg:grid lg:grid-cols-12 lg:gap-8'>
                <dt className='text-base font-semibold leading-7 text-gray-900 lg:col-span-5'>{faq.question}</dt>
                <dd className='mt-4 lg:col-span-7 lg:mt-0'>
                  <p className='text-base leading-7 text-gray-600'>{faq.answer}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </main>

      {/* Footer */}
      <div className='mx-auto mt-6 max-w-7xl px-6 lg:px-8'>
        <footer aria-labelledby='footer-heading' className='relative border-t border-gray-900/10 py-24 sm:mt-32 '>
          <h2 id='footer-heading' className='sr-only'>
            Footer
          </h2>
          <div className='flex items-center justify-end mt-10 gap-20'>
            <div>
              <h3 className='text-sm font-semibold leading-6 text-gray-900'>App</h3>
              <ul role='list' className='mt-6 space-y-4'>
                {footerNavigation.app.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className='text-sm leading-6 text-gray-600 hover:text-gray-900'>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className='text-sm font-semibold leading-6 text-gray-900'>Company</h3>
              <ul role='list' className='mt-6 space-y-4'>
                {footerNavigation.company.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className='text-sm leading-6 text-gray-600 hover:text-gray-900'>
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
