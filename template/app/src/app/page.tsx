import { ExamplesCarousel } from "../landing-page/components/ExamplesCarousel";
import { FAQ } from "../landing-page/components/FAQ";
import { FeaturesGrid } from "../landing-page/components/FeaturesGrid";
import { Footer } from "../landing-page/components/Footer";
import { Hero } from "../landing-page/components/Hero";
import { SchemaMarkup } from "../landing-page/components/SchemaMarkup";
import { Testimonials } from "../landing-page/components/Testimonials";
import {
  examples,
  faqs,
  features,
  footerNavigation,
  testimonials,
} from "../landing-page/contentSections";
import { AIReady } from "../landing-page/ExampleHighlightedFeature";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <SchemaMarkup />
      <main className="isolate">
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
