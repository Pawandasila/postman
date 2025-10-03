import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/contexts/settingsContext";
import ReactQueryProviders from "@/components/providers/react-query-providers";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PostBoy - Modern API Testing Platform",
    template: "%s | PostBoy",
  },
  description:
    "PostBoy is a powerful API testing and development platform. Build, test, and document APIs with real-time collaboration, AI-powered assistance, and intuitive workspace management.",
  keywords: [
    "API testing",
    "REST client",
    "API development",
    "HTTP client",
    "Postman alternative",
    "API documentation",
    "developer tools",
  ],
  authors: [{ name: "PostBoy Team" }],
  creator: "PostBoy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    title: "PostBoy - Modern API Testing Platform",
    description:
      "Build, test, and document APIs with real-time collaboration and AI-powered assistance.",
    siteName: "PostBoy",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostBoy - Modern API Testing Platform",
    description:
      "Build, test, and document APIs with real-time collaboration and AI-powered assistance.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ReactQueryProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SettingsProvider>
              {children}
              <Toaster richColors />
              <Analytics />
            </SettingsProvider>
          </ThemeProvider>
        </ReactQueryProviders>
      </body>
    </html>
  );
}
