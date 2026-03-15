import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

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
      <body>
        <TopBar />
        <Sidebar />
        <main style={{ marginLeft: '200px', paddingTop: '52px' }} className="animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}