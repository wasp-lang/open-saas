import { features, navigation, faqs, footerNavigation, testimonials } from './contentSections';
import Header from './_components/Header';
import Hero from './_components/Hero';
import Clients from './_components/Clients';
import Features from './_components/Features';
import Testimonials from './_components/Testimonials';
import FAQ from './_components/FAQ';
import Footer from './_components/Footer'

export default function LandingPage() {

	return (
		<div className='bg-white dark:text-white dark:bg-boxdark-2'>
			<Header navigation={navigation} />

			<main className='isolate dark:bg-boxdark-2'>
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
