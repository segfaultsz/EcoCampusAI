import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EcoCampus AI',
  description: 'Smart insights for a sustainable campus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex min-h-screen bg-slate-900">
          <Sidebar />
          <div className="flex-1 md:ml-64 flex flex-col transition-all duration-300">
            <TopBar />
            <main className="flex-1 p-4 md:p-8 lg:p-8 animate-fade-in overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}