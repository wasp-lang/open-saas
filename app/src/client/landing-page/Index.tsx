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
      <Header />
      <main className='isolate dark:bg-boxdark-2'>
        <Hero />
        <Clients />
        <Feature />
        <Testimonial />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
