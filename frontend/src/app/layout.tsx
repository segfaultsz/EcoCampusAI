import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "EcoCampus AI",
  description: "Campus sustainability dashboard",
};

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/energy": "Energy Analytics",
  "/waste": "Waste Management",
  "/predictions": "AI Predictions",
  "/recommendations": "Recommendations",
  "/reports": "Reports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Sidebar />
        <TopBar title={pageTitles["/"]} />
        <main className="ml-[256px] pt-16">
          <div className="p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
