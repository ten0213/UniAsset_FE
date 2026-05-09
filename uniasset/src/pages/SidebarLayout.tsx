import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface SidebarLayoutProps {
  children: ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="sidebar-layout">
      <Sidebar />
      <div className="sidebar-content">{children}</div>
    </div>
  );
}
