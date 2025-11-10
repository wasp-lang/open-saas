import { useAuth } from 'wasp/client/auth';
import { motion } from 'framer-motion';

export default function WaitlistPage() {
  const { data: user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-fuchsia-800 to-red-600 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <span className="text-4xl">🎉</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
        >
          You're In! Welcome to the Waitlist
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-white/90 text-center mb-8"
        >
          {user?.email && (
            <>
              Thanks for signing up, <span className="font-semibold">{user.email}</span>!
            </>
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            What Happens Next?
          </h2>
          <ul className="space-y-3 text-white/80">
            <li className="flex items-start">
              <span className="mr-3 text-2xl">1️⃣</span>
              <span>
                <strong className="text-white">Limited Seats:</strong> We're manually onboarding
                the first 100 users to ensure the best experience.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-2xl">2️⃣</span>
              <span>
                <strong className="text-white">Early Access:</strong> You'll get your invite as
                soon as a spot opens up. We're moving fast!
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-2xl">3️⃣</span>
              <span>
                <strong className="text-white">Stay Tuned:</strong> Check your email for updates,
                tips, and your activation link.
              </span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="/"
            className="px-8 py-3 bg-white text-purple-900 font-semibold rounded-xl hover:bg-white/90 transition-all text-center"
          >
            Back to Home
          </a>
          <a
            href="/account"
            className="px-8 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-center"
          >
            View Your Profile
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-white/60 text-center mt-8"
        >
          Have questions? Email us at{' '}
          <a href="mailto:hello@thaicopilot.com" className="text-white underline">
            hello@thaicopilot.com
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
