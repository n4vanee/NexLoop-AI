import './globals.css';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });

export const metadata: Metadata = {
  title: 'NexLoop AI — AI-Powered Industrial Symbiosis',
  description:
    'NexLoop AI matches industrial surplus waste with industries that can reuse it as raw material — reducing landfill, cutting CO2, and building the circular economy.',
  keywords: ['industrial symbiosis', 'circular economy', 'waste-to-resource', 'AI matching', 'ESG', 'sustainability'],
  authors: [{ name: 'NexLoop AI' }],
  openGraph: {
    title: 'NexLoop AI — AI-Powered Industrial Symbiosis',
    description: 'Turning industrial waste into resources with AI. Building the circular economy.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexLoop AI',
    description: 'AI-Powered Industrial Symbiosis Platform',
  },
  manifest: '/manifest.json',
  themeColor: '#0B4F3F',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
