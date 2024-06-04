import { Link } from 'wasp/client/router';
import { useAuth } from 'wasp/client/auth';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { AiFillCloseCircle } from 'react-icons/ai';
import { HiBars3 } from 'react-icons/hi2';
import { BiLogIn } from 'react-icons/bi';
import logo from '../static/logo.png';
import openSaasBanner from '../static/open-saas-banner.png';
import { features, navigation, faqs, footerNavigation, testimonials } from './contentSections';
import DropdownUser from '../components/DropdownUser';
import { DOCS_URL } from '../../shared/constants';
import { UserMenuItems } from '../components/UserMenuItems';
import DarkModeSwitcher from '../admin/components/DarkModeSwitcher';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user, isLoading: isUserLoading } = useAuth();

  const NavLogo = () => <img className='h-8 w-8' src={logo} alt='Your SaaS App' />;

  return (
    <div className='bg-white dark:text-white dark:bg-boxdark-2'>
      {/* Header */}
      <header className='absolute inset-x-0 top-0 z-50 dark:bg-boxdark-2'>
        <nav className='flex items-center justify-between p-6 lg:px-8' aria-label='Global'>
          <div className='flex items-center lg:flex-1'>
            <a
              href='/'
              className='flex items-center -m-1.5 p-1.5 text-gray-900 duration-300 ease-in-out hover:text-yellow-500'
            >
              <NavLogo />
              <span className='ml-2 text-sm font-semibold leading-6 dark:text-white'>Your Saas</span>
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
            <div className='flex items-center gap-3 2xsm:gap-7'>
              <ul className='flex justify-center items-center gap-2 2xsm:gap-4'>
                <DarkModeSwitcher />
              </ul>
              {isUserLoading ? null : !user ? (
                <Link to='/login'>
                  <div className='flex justify-end items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500 dark:text-white'>
                    Log in <BiLogIn size='1.1rem' className='ml-1' />
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
          <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-boxdark dark:text-white'>
            <div className='flex items-center justify-between'>
              <a href='/' className='-m-1.5 p-1.5'>
                <span className='sr-only'>Your SaaS</span>
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
                      <div className='flex justify-start items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500 dark:text-white'>
                        Log in <BiLogIn size='1.1rem' className='ml-1' />
                      </div>
                    </Link>
                  ) : (
                    <UserMenuItems user={user} />
                  )}
                </div>
                <div className='py-6'>
                  <DarkModeSwitcher />
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
                clipPath: 'polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)',
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
                <h1 className='text-4xl font-bold text-gray-900 sm:text-6xl dark:text-white'>
                  Some <span className='italic'>cool</span> words about your product
                </h1>
                <p className='mt-6 mx-auto max-w-2xl text-lg leading-8 text-gray-600 dark:text-white'>
                  With some more exciting words about your product!
                </p>
                <div className='mt-10 flex items-center justify-center gap-x-6'>
                  <a
                    href={DOCS_URL}
                    className='rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:ring-2 hover:ring-yellow-300 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-white'
                  >
                    Get Started <span aria-hidden='true'>→</span>
                  </a>
                </div>
              </div>
              <div className='mt-14 flow-root sm:mt-14 '>
                <div className='-m-2 rounded-xl  lg:-m-4 lg:rounded-2xl lg:p-4'>
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

        {/* Clients section */}
        <div className='mt-12 mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-between gap-y-6'>
          <h2 className='mb-6 text-center font-semibold tracking-wide text-gray-500 dark:text-white'>
            Built with / Used by:
          </h2>

          <div className='mx-auto grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-12 sm:max-w-xl md:grid-cols-4 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none'>
            <div className='flex justify-center col-span-1 max-h-12 w-full object-contain dark:opacity-80'>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 273 191'>
                <defs>
                  <path id='a' d='M.06.5h272v190H.06z' />
                </defs>
                <g fill-rule='evenodd'>
                  <path
                    className='dark:fill-white'
                    fill='#545454'
                    d='M113 21.3c8.78-9.14 21-14.8 34.5-14.8 18 0 33.6 10 42 24.9a58 58 0 0 1 23.7-5.05c32.4 0 58.7 26.5 58.7 59.2s-26.3 59.2-58.7 59.2c-3.96 0-7.82-.398-11.6-1.15-7.35 13.1-21.4 22-37.4 22a42.7 42.7 0 0 1-18.8-4.32c-7.45 17.5-24.8 29.8-45 29.8-21.1 0-39-13.3-45.9-32a45.1 45.1 0 0 1-9.34.972c-25.1 0-45.4-20.6-45.4-45.9 0-17 9.14-31.8 22.7-39.8a52.6 52.6 0 0 1-4.35-21c0-29.2 23.7-52.8 52.9-52.8 17.1 0 32.4 8.15 42 20.8'
                    mask='url(#b)'
                  />
                  <path
                    className='dark:fill-black'
                    fill='#FFFFFE'
                    d='M39.4 99.3c-.171.446.061.539.116.618.511.37 1.03.638 1.55.939 2.78 1.47 5.4 1.9 8.14 1.9 5.58 0 9.05-2.97 9.05-7.75v-.094c0-4.42-3.92-6.03-7.58-7.18l-.479-.155c-2.77-.898-5.16-1.68-5.16-3.5v-.093c0-1.56 1.4-2.71 3.56-2.71 2.4 0 5.26.799 7.09 1.81 0 0 .542.35.739-.173.107-.283 1.04-2.78 1.14-3.06.106-.293-.08-.514-.271-.628-2.1-1.28-5-2.15-8-2.15l-.557.002c-5.11 0-8.68 3.09-8.68 7.51v.095c0 4.66 3.94 6.18 7.62 7.23l.592.184c2.68.824 5 1.54 5 3.42v.094c0 1.73-1.51 3.02-3.93 3.02-.941 0-3.94-.016-7.19-2.07-.393-.229-.617-.394-.92-.579-.16-.097-.56-.272-.734.252l-1.1 3.06m81.7 0c-.171.446.061.539.118.618.509.37 1.03.638 1.55.939 2.78 1.47 5.4 1.9 8.14 1.9 5.58 0 9.05-2.97 9.05-7.75v-.094c0-4.42-3.91-6.03-7.58-7.18l-.479-.155c-2.77-.898-5.16-1.68-5.16-3.5v-.093c0-1.56 1.4-2.71 3.56-2.71 2.4 0 5.25.799 7.09 1.81 0 0 .542.35.74-.173.106-.283 1.04-2.78 1.13-3.06.107-.293-.08-.514-.27-.628-2.1-1.28-5-2.15-8-2.15l-.558.002c-5.11 0-8.68 3.09-8.68 7.51v.095c0 4.66 3.94 6.18 7.62 7.23l.591.184c2.69.824 5 1.54 5 3.42v.094c0 1.73-1.51 3.02-3.93 3.02-.943 0-3.95-.016-7.19-2.07-.393-.229-.623-.387-.921-.579-.101-.064-.572-.248-.733.252l-1.1 3.06m55.8-9.36c0 2.7-.504 4.83-1.49 6.34-.984 1.49-2.47 2.22-4.54 2.22s-3.55-.724-4.52-2.21c-.977-1.5-1.47-3.64-1.47-6.34 0-2.7.496-4.82 1.47-6.31.968-1.48 2.44-2.19 4.52-2.19s3.56.717 4.54 2.19c.992 1.49 1.49 3.61 1.49 6.31m4.66-5.01c-.459-1.55-1.17-2.91-2.12-4.05-.951-1.14-2.15-2.06-3.58-2.72-1.42-.665-3.1-1-5-1s-3.57.337-5 1c-1.42.664-2.63 1.58-3.58 2.72-.948 1.14-1.66 2.5-2.12 4.05-.455 1.54-.686 3.22-.686 5.01 0 1.79.231 3.47.686 5.01.457 1.55 1.17 2.91 2.12 4.05.951 1.14 2.16 2.05 3.58 2.7 1.43.648 3.11.978 5 .978 1.89 0 3.57-.33 4.99-.978 1.42-.648 2.63-1.56 3.58-2.7.949-1.14 1.66-2.5 2.12-4.05.454-1.54.685-3.22.685-5.01 0-1.78-.231-3.47-.685-5.01m38.3 12.8c-.153-.453-.595-.282-.595-.282-.677.259-1.4.499-2.17.619-.776.122-1.64.183-2.55.183-2.25 0-4.05-.671-5.33-2-1.29-1.33-2.01-3.47-2-6.37.007-2.64.645-4.62 1.79-6.14 1.13-1.5 2.87-2.28 5.17-2.28 1.92 0 3.39.223 4.93.705 0 0 .365.159.54-.322.409-1.13.711-1.94 1.15-3.18.124-.355-.18-.505-.291-.548-.604-.236-2.03-.623-3.11-.786-1.01-.154-2.18-.234-3.5-.234-1.96 0-3.7.335-5.19.999-1.49.663-2.75 1.58-3.75 2.72-1 1.14-1.76 2.5-2.27 4.05-.505 1.54-.76 3.23-.76 5.02 0 3.86 1.04 6.99 3.1 9.28 2.06 2.3 5.16 3.46 9.2 3.46 2.39 0 4.84-.483 6.6-1.18 0 0 .336-.162.19-.554l-1.15-3.16m8.15-10.4c.223-1.5.634-2.75 1.28-3.72.967-1.48 2.44-2.29 4.51-2.29s3.44.814 4.42 2.29c.65.975.934 2.27 1.04 3.72l-11.3-.002zm15.7-3.3c-.397-1.49-1.38-3-2.02-3.69-1.02-1.09-2.01-1.86-3-2.28a11.5 11.5 0 0 0-4.52-.917c-1.97 0-3.76.333-5.21 1.01-1.45.682-2.67 1.61-3.63 2.77-.959 1.16-1.68 2.53-2.14 4.1-.46 1.55-.692 3.25-.692 5.03 0 1.82.241 3.51.715 5.04.479 1.54 1.25 2.89 2.29 4.01 1.04 1.13 2.37 2.01 3.97 2.63 1.59.615 3.52.934 5.73.927 4.56-.015 6.96-1.03 7.94-1.58.175-.098.34-.267.134-.754l-1.03-2.89c-.158-.431-.594-.275-.594-.275-1.13.422-2.73 1.18-6.48 1.17-2.45-.004-4.26-.727-5.4-1.86-1.16-1.16-1.74-2.85-1.83-5.25l15.8.012s.416-.004.459-.41c.017-.168.541-3.24-.471-6.79zm-142 3.3c.223-1.5.635-2.75 1.28-3.72.968-1.48 2.44-2.29 4.51-2.29s3.44.814 4.42 2.29c.649.975.933 2.27 1.04 3.72l-11.3-.002zm15.7-3.3c-.396-1.49-1.38-3-2.02-3.69-1.02-1.09-2.01-1.86-3-2.28a11.5 11.5 0 0 0-4.52-.917c-1.97 0-3.76.333-5.21 1.01-1.45.682-2.67 1.61-3.63 2.77-.957 1.16-1.68 2.53-2.14 4.1-.459 1.55-.69 3.25-.69 5.03 0 1.82.239 3.51.716 5.04.478 1.54 1.25 2.89 2.28 4.01 1.04 1.13 2.37 2.01 3.97 2.63 1.59.615 3.51.934 5.73.927 4.56-.015 6.96-1.03 7.94-1.58.174-.098.34-.267.133-.754l-1.03-2.89c-.159-.431-.595-.275-.595-.275-1.13.422-2.73 1.18-6.48 1.17-2.44-.004-4.26-.727-5.4-1.86-1.16-1.16-1.74-2.85-1.83-5.25l15.8.012s.416-.004.459-.41c.017-.168.541-3.24-.472-6.79zm-49.8 13.6c-.619-.494-.705-.615-.91-.936-.313-.483-.473-1.17-.473-2.05 0-1.38.46-2.38 1.41-3.05-.01.002 1.36-1.18 4.58-1.14a32 32 0 0 1 4.28.365v7.17h.002s-2 .431-4.26.567c-3.21.193-4.63-.924-4.62-.921zm6.28-11.1c-.64-.047-1.47-.07-2.46-.07-1.35 0-2.66.168-3.88.498-1.23.332-2.34.846-3.29 1.53a7.63 7.63 0 0 0-2.29 2.6c-.559 1.04-.844 2.26-.844 3.64 0 1.4.243 2.61.723 3.6a6.54 6.54 0 0 0 2.06 2.47c.877.638 1.96 1.11 3.21 1.39 1.24.283 2.64.426 4.18.426 1.62 0 3.23-.136 4.79-.399a95.1 95.1 0 0 0 3.97-.772c.526-.121 1.11-.28 1.11-.28.39-.099.36-.516.36-.516l-.009-14.4c0-3.16-.844-5.51-2.51-6.96-1.66-1.45-4.09-2.18-7.24-2.18-1.18 0-3.09.16-4.23.389 0 0-3.44.668-4.86 1.78 0 0-.312.192-.142.627l1.12 3c.139.389.518.256.518.256s.119-.047.259-.13c3.03-1.65 6.87-1.6 6.87-1.6 1.7 0 3.02.345 3.9 1.02.861.661 1.3 1.66 1.3 3.76v.667c-1.35-.196-2.6-.309-2.6-.309zm127-8.13a.428.428 0 0 0-.237-.568c-.269-.102-1.61-.385-2.64-.449-1.98-.124-3.08.21-4.07.654-.978.441-2.06 1.15-2.66 1.97l-.002-1.92c0-.264-.187-.477-.453-.477h-4.04c-.262 0-.452.213-.452.477v23.5a.48.48 0 0 0 .479.479h4.14a.479.479 0 0 0 .478-.479v-11.8c0-1.58.174-3.15.521-4.14.342-.979.807-1.76 1.38-2.32a4.79 4.79 0 0 1 1.95-1.17 7.68 7.68 0 0 1 2.12-.298c.825 0 1.73.212 1.73.212.304.034.473-.152.576-.426.271-.721 1.04-2.88 1.19-3.31'
                  />
                  <path
                    className='dark:fill-black'
                    fill='#FFFFFE'
                    d='M162.201 67.548a13.258 13.258 0 0 0-1.559-.37 12.217 12.217 0 0 0-2.144-.166c-2.853 0-5.102.806-6.681 2.398-1.568 1.58-2.635 3.987-3.17 7.154l-.193 1.069h-3.581s-.437-.018-.529.459l-.588 3.28c-.041.314.094.51.514.508h3.486l-3.537 19.743c-.277 1.59-.594 2.898-.945 3.889-.346.978-.684 1.711-1.1 2.243-.403.515-.785.894-1.444 1.115-.544.183-1.17.267-1.856.267-.382 0-.89-.064-1.265-.139-.375-.074-.57-.158-.851-.276 0 0-.409-.156-.57.254-.131.335-1.06 2.89-1.17 3.206-.112.312.045.558.243.629.464.166.809.272 1.441.421.878.207 1.618.22 2.311.22 1.452 0 2.775-.204 3.872-.6 1.104-.399 2.065-1.094 2.915-2.035.919-1.015 1.497-2.078 2.05-3.528.547-1.437 1.013-3.221 1.386-5.3l3.554-20.109h5.196s.438.016.529-.459l.588-3.28c.041-.314-.093-.51-.515-.508h-5.043c.025-.114.254-1.888.833-3.558.247-.713.712-1.288 1.106-1.683a3.273 3.273 0 0 1 1.321-.822 5.48 5.48 0 0 1 1.693-.244c.475 0 .941.057 1.296.131.489.104.679.159.807.197.514.157.583.005.684-.244l1.206-3.312c.124-.356-.178-.506-.29-.55m-70.474 34.117c0 .264-.188.479-.452.479h-4.183c-.265 0-.453-.215-.453-.479V67.997c0-.263.188-.476.453-.476h4.183c.264 0 .452.213.452.476v33.668'
                  />
                </g>
              </svg>
            </div>
            <div className='flex justify-center col-span-1 max-h-12 w-full object-contain dark:opacity-80'>
              <svg width={48} height={48} viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'>
                <path
                  className='dark:fill-white'
                  fill='#545454'
                  d='M25.21,24.21,12.739,27.928a.525.525,0,0,1-.667-.606L16.528,5.811a.43.43,0,0,1,.809-.094l8.249,17.661A.6.6,0,0,1,25.21,24.21Zm2.139-.878L17.8,2.883h0A1.531,1.531,0,0,0,16.491,2a1.513,1.513,0,0,0-1.4.729L4.736,19.648a1.592,1.592,0,0,0,.018,1.7l5.064,7.909a1.628,1.628,0,0,0,1.83.678l14.7-4.383a1.6,1.6,0,0,0,1-2.218Z'
                />
              </svg>
            </div>
            <div className='flex justify-center col-span-1 w-full max-h-12 object-contain dark:opacity-80'>
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
              <svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMidYMid' viewBox='0 0 256 260'>
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
              The <span className='text-yellow-500'>Best</span> Features
            </p>
            <p className='mt-6 text-lg leading-8 text-gray-600 dark:text-white'>
              Don't work harder.
              <br /> Work smarter.
            </p>
          </div>
          <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl'>
            <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16'>
              {features.map((feature) => (
                <div key={feature.name} className='relative pl-16'>
                  <dt className='text-base font-semibold leading-7 text-gray-900 dark:text-white'>
                    <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center border border-yellow-400 bg-yellow-100/50 dark:bg-boxdark rounded-lg'>
                      <div className='text-2xl'>{feature.icon}</div>
                    </div>
                    {feature.name}
                  </dt>
                  <dd className='mt-2 text-base leading-7 text-gray-600 dark:text-white'>{feature.description}</dd>
                </div>
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
                      <a href={testimonial.socialUrl} className='flex items-center gap-x-2'>
                        <img src={testimonial.avatarSrc} className='h-12 w-12 rounded-full' />
                        <div>
                          <div className='font-semibold hover:underline'>{testimonial.name}</div>
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
        <div className='mt-32 mx-auto max-w-2xl divide-y divide-gray-900/10 dark:divide-gray-200/10 px-6 pb-8 sm:pb-24 sm:pt-12 lg:max-w-7xl lg:px-8 lg:py-32'>
          <h2 className='text-2xl font-bold leading-10 tracking-tight text-gray-900 dark:text-white'>
            Frequently asked questions
          </h2>
          <dl className='mt-10 space-y-8 divide-y divide-gray-900/10'>
            {faqs.map((faq) => (
              <div key={faq.id} className='pt-8 lg:grid lg:grid-cols-12 lg:gap-8'>
                <dt className='text-base font-semibold leading-7 text-gray-900 lg:col-span-5 dark:text-white'>
                  {faq.question}
                </dt>
                <dd className='flex items-center justify-start gap-2 mt-4 lg:col-span-7 lg:mt-0'>
                  <p className='text-base leading-7 text-gray-600 dark:text-white'>{faq.answer}</p>
                  {faq.href && (
                    <a href={faq.href} className='text-base leading-7 text-yellow-500 hover:text-yellow-600'>
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
          className='relative border-t border-gray-900/10 dark:border-gray-200/10 py-24 sm:mt-32'
        >
          <h2 id='footer-heading' className='sr-only'>
            Footer
          </h2>
          <div className='flex items-start justify-end mt-10 gap-20'>
            <div>
              <h3 className='text-sm font-semibold leading-6 text-gray-900 dark:text-white'>App</h3>
              <ul role='list' className='mt-6 space-y-4'>
                {footerNavigation.app.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className='text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-white'>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className='text-sm font-semibold leading-6 text-gray-900 dark:text-white'>Company</h3>
              <ul role='list' className='mt-6 space-y-4'>
                {footerNavigation.company.map((item) => (
                  <li key={item.name}>
                    <a href={item.href} className='text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-white'>
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
