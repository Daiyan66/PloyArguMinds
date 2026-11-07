import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
