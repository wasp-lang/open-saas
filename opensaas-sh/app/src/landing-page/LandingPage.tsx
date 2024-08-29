import { useState } from 'react';
import { features, navigation, faqs, footerNavigation, testimonials } from './contentSections';
import Header from './components/Header';
import Hero from './components/Hero';
import Clients from './components/Clients';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import CookieConsentBanner from '../client/components/cookie-consent/Banner';

export default function LandingPage() {
  const [isAnnoyingCookieBanner, setShowIsAnnoyingCookieBanner] = useState(true);

  return (
    <div className='bg-white dark:text-white dark:bg-boxdark-2'>
      <Header navigation={navigation} setShowCookieBanner={setShowIsAnnoyingCookieBanner} />

      <main className='isolate dark:bg-boxdark-2'>
        <Hero />
        <Clients />
        <Features features={features} />
        <Testimonials testimonials={testimonials} />
        <FAQ faqs={faqs} />
      </main>

      <Footer footerNavigation={footerNavigation} />
      {isAnnoyingCookieBanner && <CookieConsentBanner  showCookieBanner={isAnnoyingCookieBanner} setShowCookieBanner={setShowIsAnnoyingCookieBanner} />}
    </div>
  );
}
