import { features, navigation, faqs, footerNavigation, testimonials } from './contentSections';
import Header from './Header';
import Hero from './Hero';
import Clients from './Clients';
import Feature from './Feature';
import Testimonial from './Testimonial';
import FAQ from './FAQ';
import Footer from './Footer';

export default function LandingPage() {

  return (
    <div className='bg-white dark:text-white dark:bg-boxdark-2'>
	  {/* Header */}	
      <Header navigation={navigation}/>

      <main className='isolate dark:bg-boxdark-2'>
        {/* Hero section */}
        <Hero />

        {/* Clients section */}
        <Clients />

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
