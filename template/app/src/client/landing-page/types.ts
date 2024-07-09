interface NavigationItem {
  name: string;
  href: string;
};

// HEADER
export interface HeaderProps {
	navigation: NavigationItem[]
}

// FEATURE
interface Feature {
  name: string;
  description: string;
  icon: string;
  href: string;
};

export interface FeatureProps {
	features: Feature[]
}

// TESTIMONIAL
interface Testimonial {
  name: string;
  role: string;
  avatarSrc: string;
  socialUrl: string;
  quote: string;
};

export interface TestimonialProps {
	testimonials: Testimonial[]
}

// FAQ
interface FAQ {
  id: number;
  question: string;
  answer: string;
  href: string;
};

export interface FAQProps {
	faqs: FAQ[]
}

// FOOTER
interface FooterNavigationProp {
	app: NavigationItem[]
	company: NavigationItem[]
}

export interface FooterProps {
	footerNavigation: FooterNavigationProp
}