import ExamplesCarousel from './components/ExamplesCarousel';
import FAQ from './components/FAQ';
import FeaturesGrid from './components/FeaturesGrid';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Testimonials from './components/Testimonials';
import AIReady from './ExampleHighlightedFeature';
import { examples, faqs, getFeatures, footerNavigation, testimonials } from './contentSections';
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const { t } = useTranslation();
  const features = getFeatures(t);
  
  return (
    <div className='bg-background text-foreground'>
      <main className='isolate'>
        <Hero />
        <ExamplesCarousel examples={examples} />
        <AIReady />
        <FeaturesGrid features={features} />
        <Testimonials testimonials={testimonials} />
        <FAQ faqs={faqs} />
      </main>
      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}

