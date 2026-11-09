import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata: Metadata = {
  title: 'PolyArguMinds | Autonomous Dialectic Stress-Testing Engine',
  description: 'Autonomous multi-agent adversarial reasoning, real-time fallacy checking, and executive decision arbiter.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
