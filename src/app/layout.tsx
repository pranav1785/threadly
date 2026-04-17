import type { Metadata } from "next";
import { Rubik, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Threadly — Universal Product Discovery",
    template: "%s | Threadly",
  },
  description:
    "Discover and compare products across Amazon, Flipkart, Meesho, Myntra and local stores. AI-powered search, real-time alerts, and agentic store calling.",
  keywords: ["ecommerce", "product search", "price comparison", "online shopping", "threadly"],
  authors: [{ name: "Threadly" }],
  creator: "Threadly",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    title: "Threadly — Universal Product Discovery",
    description: "AI-powered product discovery across all major e-commerce platforms",
    siteName: "Threadly",
  },
  twitter: { card: "summary_large_image", title: "Threadly", description: "Universal product discovery" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rubik.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Google Analytics 4 */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className={`font-body antialiased`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#1E293B", color: "#F1F5F9", borderRadius: "12px", fontFamily: "var(--font-body)" },
          }}
        />
      </body>
    </html>
  );
}
