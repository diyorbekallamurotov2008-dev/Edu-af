import './globals.css';
import { Nav } from '@/components/Nav';

export const metadata = { title: "Tez Lug'at" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="max-w-5xl mx-auto p-4 space-y-4">
        <header className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <h1 className="text-2xl font-bold">Tez Lug‘at</h1>
          <Nav />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
