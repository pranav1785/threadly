# 🧶 Threadly: Universal Product Discovery & Agentic Shopping

**Threadly** is a high-fidelity, AI-powered e-commerce discovery platform designed to eliminate the friction of fragmented shopping. By unifying inventories from global giants and local brick-and-mortar stores, Threadly provides a single, agentic interface for finding anything, anywhere.

![Threadly Banner](https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80)

## 🚀 Key Features

### 🔍 Universal AI Search (Gemini 1.5 Pro)
Harness the power of Google's Gemini to search across Amazon, Flipkart, Myntra, Meesho, and 50,000+ local stores simultaneously. Gemini understands natural language queries like *"I need a summer wedding dress under 5k available near Mumbai"* and retrieves the most relevant matches.

### 📞 Agentic Store Calling (Sarvam AI)
Stop calling stores manually to check inventory. Threadly uses **Sarvam AI** to automatically call local retailers, verify stock levels, and confirm prices for you, delivering real-time availability for offline products.

### 📍 Local Inventory Network
Threadly bridges the gap between online and offline. Browse inventories of thousands of local shops that traditionally don't have an online presence, powered by our distributed retailer network.

### ⚡ Seamless Guest Explorer
We believe in friction-less discovery. Use **Threadly** instantly without mandatory sign-ups. Our "Guest Explorer" mode gives you full access to search and discovery features with one click.

---

## 🎨 Design System: Stitch

Threadly is built using the **Stitch Design System**, a premium UI/UX framework characterized by:
- **Rounded Geometry**: `2rem` pill-shaped containers for a modern, friendly feel.
- **Glassmorphism**: Subtle backdrops and layered depth.
- **Vibrant Palette**: Google-inspired colors (Primary: #4285F4, CTA: #FBBC05, Accent: #EA4335).
- **Micro-animations**: Smooth transitions powered by Framer Motion.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Authentication**: Firebase Auth (with Guest Bypass logic)
- **Database**: Firebase Firestore
- **AI/ML**: 
  - Google Gemini API (Universal Search & Reasoning)
  - Sarvam AI (Voice Interaction & Automated Calling)
- **Deployment**: Google Cloud Run / Firebase App Hosting

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/pranav1785/threadly.git
cd threadly
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
GEMINI_API_KEY=...
SARVAM_API_KEY=...
```

### 4. Run Locally
```bash
npm run dev
```

---

## 🚢 Deployment

### Google Cloud Run
Threadly is containerized and ready for GCP:
```bash
gcloud builds submit --config cloudbuild.yaml
```

### Firebase Hosting
```bash
firebase deploy
```

---

## 📄 License
© 2025 Threadly. Built for the future of agentic commerce.
