import Clients from './components/Clients';
import FAQ from './components/FAQ';
import Features from './components/Features';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Testimonials from './components/Testimonials';
import { faqs, features, footerNavigation, testimonials } from './contentSections';

export default function LandingPage() {
  return (
    <div className='bg-background text-foreground'>
      <main className='isolate'>
        <Hero />
        <Clients />
        <Features features={features} />
        <Testimonials testimonials={testimonials} />
        <FAQ faqs={faqs} />
      </main>
      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}
