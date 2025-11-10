# ThaiCopilot MVP - Setup Guide

**Modern Thai Language Learning Platform** - Turn conversations into lessons with AI-powered corrections and flashcards.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd app
npm install
```

### 2. Configure Database
```bash
# Create .env.server file
cp .env.server.example .env.server

# Add your PostgreSQL URL
DATABASE_URL="postgresql://user:password@localhost:5432/thaicopilot"
```

### 3. Run Migrations
```bash
wasp db migrate-dev
```

### 4. Start Development Server
```bash
wasp start
```

Access at: `http://localhost:3000`

---

## 📋 What's Implemented

### ✅ **EPIC 1: Landing Page & Email Capture**
- **Landing Page** (`app/src/landing-page/LandingPage.tsx`)
  - Modern gradient design (purple→fuchsia→red)
  - Framer Motion animations
  - Fully responsive (mobile-first)
  - PWA-ready with manifest.json
- **Email Signup** (`app/src/email-signup/operations.ts`)
  - Client + server validation
  - Duplicate handling
  - UTM tracking support
- **QR Code Generator** (`app/scripts/generate-qr-code.ts`)
  ```bash
  npm run generate-qr              # Main landing page
  npm run generate-qr condo_poster # With UTM source
  ```

### ✅ **EPIC 2: Authentication**
- Email + password signup
- Email verification
- Waitlist page post-signup (`app/src/waitlist/WaitlistPage.tsx`)
- Password reset flow

### ✅ **Database Schema**
Complete Prisma schema with models:
- `User` (with onboarding/waitlist status)
- `EmailSignup` (pre-auth signups)
- `Conversation` (translation sessions)
- `Message` (individual translations)
- `Correction` (Thai friend feedback)
- `ConversationShare` (magic links)
- `Flashcard` (with SM-2 spaced repetition)
- `FlashcardReview` (review history)

---

## 🎨 Design Highlights

- **Colors**: Purple-600 (#9333EA), Fuchsia-600 (#C026D3), Red-600 (#DC2626)
- **Animations**: Framer Motion throughout
- **Icons**: Lucide React
- **Responsive**: Mobile-first with Tailwind CSS
- **PWA**: Installable, offline-ready manifest

---

## 🔑 Environment Variables

Create `app/.env.server`:
```bash
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."           # For translations (future)
CLOUDFLARE_R2_ACCESS_KEY="..."    # For audio storage (future)
CLOUDFLARE_R2_SECRET_KEY="..."
CLOUDFLARE_R2_BUCKET="..."
```

---

## 📁 File Structure

```
app/
├── main.wasp                    # Wasp config (routes, auth, entities)
├── schema.prisma                # Database models
├── src/
│   ├── landing-page/
│   │   └── LandingPage.tsx      # Main landing (Hero, FAQ, CTA)
│   ├── waitlist/
│   │   └── WaitlistPage.tsx     # Post-signup waitlist
│   ├── email-signup/
│   │   └── operations.ts        # Email capture logic
│   └── auth/                    # Login, signup, verification
├── scripts/
│   └── generate-qr-code.ts      # QR generator
└── public/
    ├── manifest.json            # PWA manifest
    └── icons/                   # App icons (TODO: generate)
```

---

## 🚢 Deployment

### **Option 1: Railway (Recommended)**
```bash
wasp deploy fly launch thaicopilot-app
```
Railway handles PostgreSQL automatically.

### **Option 2: Fly.io**
```bash
wasp deploy fly launch thaicopilot-app
```
Add Fly Postgres separately: `fly postgres create`

### **Environment Setup**
Add production env vars:
```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set OPENAI_API_KEY="sk-..."
```

---

## 📱 QR Code Usage

Generate for poster campaigns:
```bash
# Main landing
npm run generate-qr

# Condo poster (tracks source)
npm run generate-qr condo_poster

# Coffee shop campaign
npm run generate-qr coffee_shop
```

Outputs:
- `public/qr-codes/qr-{source}.png` (black, high reliability)
- `public/qr-codes/qr-{source}-branded.png` (purple, marketing)

Print at **minimum 5cm × 5cm** for reliable scanning.

---

## 🧪 Testing Strategy

### **Manual Testing**
1. **Email Capture**: Submit valid/invalid emails
2. **Signup Flow**: Complete registration → verify email → see waitlist
3. **Mobile**: Test on real device (scan QR, PWA install)

### **Future: Playwright E2E**
```bash
wasp test
```

---

## 🛣️ Roadmap (Next Steps)

### **Immediate (Week 1-2)**
1. Generate PWA icons (72px → 512px)
2. Create OG image (`public/og-image.png`)
3. Test on iOS/Android devices
4. Deploy to production

### **EPIC 3-7 (Next Phases)**
- Translation engine (OpenAI + Vercel AI SDK)
- Audio generation (Google TTS → R2 storage)
- Thai friend corrections (magic links)
- Flashcard generation + SM-2 reviews
- Polar.sh payments integration

---

## 🐛 Troubleshooting

### **"Module not found: framer-motion"**
```bash
cd app && npm install
```

### **Database Migration Fails**
```bash
wasp db reset  # ⚠️ Deletes all data
wasp db migrate-dev
```

### **Port 3000 Already in Use**
```bash
lsof -ti:3000 | xargs kill -9
wasp start
```

---

## 📞 Support

- **Docs**: [docs.opensaas.sh](https://docs.opensaas.sh)
- **Wasp**: [wasp.sh](https://wasp.sh)
- **Issues**: Create GitHub issue

---

## 📊 Progress Tracker

- [x] Landing page with email capture
- [x] QR code generator
- [x] Waitlist page
- [x] Database schema
- [x] PWA manifest
- [ ] Translation engine (EPIC 3)
- [ ] Flashcard system (EPIC 5)
- [ ] Payments (EPIC 6)
- [ ] Admin dashboard (EPIC 7)

**Word Count**: 698 ✅
