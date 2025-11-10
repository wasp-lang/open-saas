import { motion } from 'framer-motion';
import { useState } from 'react';
import { submitEmailSignup } from 'wasp/client/operations';
import { Mic, CircleCheck, GraduationCap, Check, Gift, Lightbulb, BadgePercent, MessageCircle, ChevronDown } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [source, setSource] = useState('');

  // Get UTM source from URL
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    setSource(params.get('source') || '');
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await submitEmailSignup({ email, source });
      setSubmitMessage("You're on the list! We'll email you with updates.");
      setEmail('');
    } catch (error: any) {
      setSubmitMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center space-y-8"
            >
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-fuchsia-600 to-red-600 bg-clip-text text-transparent sm:text-5xl lg:text-6xl text-balance"
                >
                  Turn Every Thai Conversation Into a Lesson
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-lg text-slate-600 sm:text-xl max-w-2xl"
                >
                  Record your conversations with friends, taxi drivers, or restaurant staff. Use it
                  to further build your Thai Skills. Never forget what you learned.
                </motion.p>
              </div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 sm:flex-row sm:gap-3 max-w-md"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 flex-1 rounded-md border-2 border-slate-200 px-4 text-base focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 transition-all"
                  aria-label="Email address"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-red-600 text-white shadow-md hover:shadow-lg focus-visible:ring-fuchsia-600 h-14 px-10 py-4 text-base min-w-[200px] font-semibold"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Joining...' : 'Join the Alpha (50 Spots)'}
                </motion.button>
              </motion.form>

              {submitMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm ${
                    submitMessage.includes('on the list') ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {submitMessage}
                </motion.p>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-sm text-slate-500"
              >
                For expats living in Thailand
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative lg:pl-8"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-fuchsia-50 to-red-50 shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }}
                      className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white text-3xl shadow-lg"
                    >
                      🎙️
                    </motion.div>
                    <p className="text-slate-600 font-medium">App Interface Mockup</p>
                    <p className="text-sm text-slate-500 max-w-xs">
                      iPhone mockup showing Thai text with corrections will be placed here
                    </p>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-300 blur-2xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: 1,
                }}
                className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-fuchsia-300 blur-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Who This Is For Section */}
      <WhoThisIsForSection />

      {/* Alpha Perks Section */}
      <AlphaPerksSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <FinalCTASection email={email} setEmail={setEmail} handleSubmit={handleSubmit} isSubmitting={isSubmitting} submitMessage={submitMessage} />
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: Mic,
      title: 'Record Any Conversation',
      description:
        'Talk with Thai friends, order food, take a taxi. Hit record and have a normal conversation. No scripts, no awkwardness.',
    },
    {
      number: '02',
      icon: CircleCheck,
      title: 'Get Instant Corrections',
      description:
        'See what you said, what you meant to say, and how to say it better next time. AI-powered feedback that actually makes sense.',
    },
    {
      number: '03',
      icon: GraduationCap,
      title: 'Review Your Flashcards',
      description:
        'Every conversation becomes a personalized lesson. Review anytime, anywhere. Learn from your real life, not textbooks.',
    },
  ];

  return (
    <section className="bg-white px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-fuchsia-600 to-red-600 bg-clip-text text-transparent sm:text-4xl lg:text-5xl mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Three simple steps to turn everyday conversations into Thai learning opportunities
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-fuchsia-200"
            >
              <div className="absolute -top-4 -right-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white font-bold text-lg shadow-lg">
                {step.number}
              </div>
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-fuchsia-50">
                <step.icon className="h-8 w-8 text-fuchsia-600" strokeWidth={2} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoThisIsForSection() {
  const points = [
    'Already try to speak Thai but forget everything by the next day',
    'Have Thai friends but no structured way to improve from conversations',
    'Want to learn from real situations (not "the pen is on the table")',
    'Are willing to test early software and give honest feedback',
    "Are tired of apps that teach you words you'll never use",
  ];

  return (
    <section className="bg-gradient-to-br from-slate-50 to-purple-50 px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-fuchsia-600 to-red-600 bg-clip-text text-transparent sm:text-4xl lg:text-5xl mb-4"
        >
          Built for Expats Actually Living in Thailand
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-lg text-slate-600 mb-12"
        >
          This alpha is perfect if you:
        </motion.p>

        <div className="space-y-4 text-left max-w-2xl mx-auto">
          {points.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="flex items-start gap-4 rounded-lg bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600">
                  <Check className="h-4 w-4 text-white" strokeWidth={3} />
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{point}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AlphaPerksSection() {
  const perks = [
    {
      icon: Gift,
      title: 'Free for 3 Months',
      description: 'Full access, zero cost during alpha',
    },
    {
      icon: Lightbulb,
      title: 'Shape the Product',
      description: 'Your feedback directly influences what we build',
    },
    {
      icon: BadgePercent,
      title: 'Lifetime Discount',
      description: '50% off forever when we launch publicly',
    },
    {
      icon: MessageCircle,
      title: 'Direct Founder Access',
      description: 'Talk directly to me (the founder). No support tickets.',
    },
  ];

  return (
    <section className="bg-white px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-fuchsia-600 to-red-600 bg-clip-text text-transparent sm:text-4xl lg:text-5xl mb-4"
          >
            Alpha Tester Perks
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Be among the first 50 people to shape the future of Thai language learning
          </motion.p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:gap-10">
          {perks.map((perk, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-fuchsia-200"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-md"
              >
                <perk.icon className="h-7 w-7" strokeWidth={2} />
              </motion.div>
              <h3 className="mb-2 text-xl font-semibold text-slate-900">{perk.title}</h3>
              <p className="text-slate-600 leading-relaxed">{perk.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Do I need Thai friends to use this?',
      answer:
        'Not required, but helpful. You can also practice solo or record conversations with taxi drivers, restaurant staff, or anyone willing to chat.',
    },
    {
      question: 'Is this an app I download?',
      answer:
        "It's web-based for now. Just open in your phone's browser—no download needed. Works on iPhone and Android.",
    },
    {
      question: 'How much does it cost after alpha?',
      answer:
        "We're planning $15/month when we launch. But as an alpha tester, you get 50% off for life ($7.50/month).",
    },
    {
      question: "What if I'm a complete beginner?",
      answer:
        "Perfect! The best time to start is with your first real conversation. Even if you only know 10 words, you'll start building useful vocabulary immediately.",
    },
    {
      question: 'How accurate are the corrections?',
      answer:
        "We use AI (GPT-4) trained on Thai language patterns. It's surprisingly good, but this is alpha—so expect 80-90% accuracy. You can always flag incorrect corrections.",
    },
    {
      question: 'What happens to my audio recordings?',
      answer:
        "They're stored securely and only used to generate your transcripts and flashcards. We never share or sell your data. You can delete recordings anytime.",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-slate-50 to-fuchsia-50 px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-fuchsia-600 to-red-600 bg-clip-text text-transparent sm:text-4xl lg:text-5xl mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg text-slate-600"
          >
            Everything you need to know about the ThaiCopilot alpha
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="space-y-1">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-slate-200 last:border-0">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between py-5 text-left font-medium transition-all hover:text-fuchsia-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-600 focus-visible:ring-offset-2 text-base sm:text-lg"
                  aria-expanded={openIndex === index}
                >
                  {faq.question}
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5 shrink-0" aria-hidden="true" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="text-slate-600 text-base pb-5">{faq.answer}</div>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTASection({ email, setEmail, handleSubmit, isSubmitting, submitMessage }: any) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-fuchsia-900 to-red-900 px-6 py-20 sm:px-8 lg:px-12 lg:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-6"
        >
          Ready to Actually Improve Your Thai?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto"
        >
          Join 50 expats testing ThaiCopilot. Limited spots available.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:gap-3 max-w-lg mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 flex-1 rounded-lg border-2 border-slate-600 bg-slate-800 px-5 text-base text-white placeholder:text-slate-400 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
            aria-label="Email address"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-purple-900 hover:bg-slate-100 focus-visible:ring-white px-10 py-4 min-w-[220px] font-semibold text-base h-14 shadow-lg"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Requesting...' : 'Request Alpha Access'}
          </motion.button>
        </motion.form>

        {submitMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm mb-4 ${
              submitMessage.includes('on the list') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {submitMessage}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-sm text-slate-400"
        >
          No credit card required. Just your email.
        </motion.p>
      </div>

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-fuchsia-600 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: 1,
        }}
        className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-purple-600 blur-3xl"
      />
    </section>
  );
}
