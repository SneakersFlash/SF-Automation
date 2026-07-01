import { redirect } from 'next/navigation';

// Entry: arahkan ke halaman kerja utama (IA §5.2). Auth-guard diwire di Fase 3.
export default function Home() {
  redirect('/creative/brief');
}
