import Header from './Header';
import Hero from './Hero';
import Clients from './Clients';
import Feature from './Feature';
import Testimonial from './Testimonial';
import Faq from './Faq';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className='bg-white dark:text-white dark:bg-boxdark-2'>
      {/* Header */}
      <Header />
      <main className='isolate dark:bg-boxdark-2'>
        {/* Hero section */}
        <Hero />
        {/* Clients section */}
        <Clients />
        {/* Feature section */}
        <Feature />
        {/* Testimonial section */}
        <Testimonial />
        {/* FAQ */}
        <Faq />
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}
