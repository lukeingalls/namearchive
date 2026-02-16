import { Outlet } from 'react-router';
import { SiteFooter } from './SiteFooter';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f5f1e8] flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
