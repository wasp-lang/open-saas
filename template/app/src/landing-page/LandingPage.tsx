import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import Clients from './components/Clients';
import ExamplesCarousel from './components/ExamplesCarousel';
import FAQ from './components/FAQ';
import Features from './components/Features';
import Footer from './components/Footer';
import Hero from './components/Hero';
import HighlightedFeature from './components/HighlightedFeature';
import Testimonials from './components/Testimonials';
import { examples, faqs, features, footerNavigation, testimonials } from './contentSections';

export default function LandingPage() {
  return (
    <div className='bg-background text-foreground'>
      <main className='isolate'>
        <Hero />
        <ExamplesCarousel examples={examples} />
        <HighlightedFeature
          name='Very Important Feature'
          description='Consectetur esse anim irure pariatur incididunt in nostrud sint ea ea esse tempor est laborum elit. Elit laboris adipisicing fugiat non id cupidatat enim.'
          highlightedComponent={
            <Card>
              <CardHeader>
                <CardTitle>Log in</CardTitle>
                <CardDescription>Log in to your account</CardDescription>
              </CardHeader>
            </Card>
          }
        />
        <HighlightedFeature
          name='Very Important Feature'
          description='Consectetur esse anim irure pariatur incididunt in nostrud sint ea ea esse tempor est laborum elit. Elit laboris adipisicing fugiat non id cupidatat enim.'
          direction='row-reverse'
          highlightedComponent={<div>Highlighted Component</div>}
        />
        <Clients />
        <Features features={features} />
        <Testimonials testimonials={testimonials} />
        <FAQ faqs={faqs} />
      </main>
      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}
