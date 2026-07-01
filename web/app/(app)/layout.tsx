import { Rail } from '@/components/shell/Rail';
import { Topbar } from '@/components/shell/Topbar';

// Shell aplikasi (rail + topbar) — DS §8.1, IA §11.2. Berlaku untuk semua
// halaman terautentikasi. Route group (app) tidak menambah segmen URL.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Rail />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
