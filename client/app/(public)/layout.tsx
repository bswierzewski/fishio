import { AuthGuard } from '@/components/AuthGuard';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen">{children}</div>
    </AuthGuard>
  );
}
