import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <AppSidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          toggleMobileSidebar={() => setMobileOpen(!mobileOpen)} 
        />
        <main className="flex-1 overflow-auto bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
