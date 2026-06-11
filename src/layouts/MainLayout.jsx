import React from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function MainLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main style={{ flex: 1, overflow: 'auto' }}>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
