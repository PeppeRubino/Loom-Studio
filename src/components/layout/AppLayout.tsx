import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { SettingsDrawer } from '@/components/layout/SettingsDrawer';
import { TopBar } from '@/components/layout/TopBar';

export const AppLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="user-select-none min-h-screen w-full px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col rounded-[26px] border border-[var(--glass-border)] bg-[var(--glass)]/80 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.55)] ">
        <TopBar onOpenSettings={() => setDrawerOpen(true)} />
        <main className="flex-1 px-6 pb-8 pt-4">
          <Outlet />
        </main>
      </div>
      <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

