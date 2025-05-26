import { AuthGuard } from '@/components/AuthGuard';
import BottomNavbar from '@/components/layout/BottomNavbar';
import Navbar from '@/components/layout/Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 pt-4 pb-20 flex-grow">{children}</main>
        <BottomNavbar />
      </div>
    </AuthGuard>
  );
}
