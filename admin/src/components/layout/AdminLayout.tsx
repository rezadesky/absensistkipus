import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground">
      {/* Desktop Sidebar (Persistent) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <Sidebar className="w-64" />
      </div>

      {/* Mobile Drawer (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 max-w-[85vw] bg-[#172554] border-r-0">
          <Sidebar onItemClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col w-full max-w-full min-w-0 md:pl-64 overflow-x-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 w-full max-w-full min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
