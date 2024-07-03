import { features, navigation, faqs, footerNavigation, testimonials } from './contentSections';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Client from '../components/Client';
import Feature from '../components/Feature';
import Testimonial from '../components/Testimonial';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function LandingPage() {

  return (
    <div className='bg-white dark:text-white dark:bg-boxdark-2'>
	  {/* Header */}	
      <Header navigation={navigation}/>

      <main className='isolate dark:bg-boxdark-2'>
        {/* Hero section */}
        <Hero />

        {/* Clients section */}
        <Client />

        {/* Feature section */}
        <Feature features={features}/>

        {/* Testimonial section */}
        <Testimonial testimonials={testimonials}/>

        {/* FAQ */}
        <FAQ faqs={faqs}/>
      </main>

      {/* Footer */}
      <Footer footerNavigation={footerNavigation}/>
    </div>
  );
}
