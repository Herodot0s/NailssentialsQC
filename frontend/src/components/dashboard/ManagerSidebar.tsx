import React from 'react';
import {
  DollarSign, Users, Clock, Wallet, Star, Settings,
  PieChart as PieChartIcon, Image as ImageIcon, FileText, Package, BarChart2
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { ManagerSidebarProps, ActiveView } from './types';

const menuItems: { id: ActiveView; label: string; icon: React.ElementType }[] = [
  { id: 'analytics', label: 'Dashboard', icon: PieChartIcon },
  { id: 'staff', label: 'Employee Files', icon: Users },
  { id: 'attendance', label: 'Attendance Tool', icon: Clock },
  { id: 'deductions', label: 'Deductions Ledger', icon: Wallet },
  { id: 'payroll', label: 'Salary Slips', icon: DollarSign },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'exhibits', label: 'Exhibit Gallery', icon: ImageIcon },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'packages', label: 'Packages', icon: Package },
  { id: 'advanced-analytics', label: 'Analytics', icon: BarChart2 },
];

export const ManagerSidebar: React.FC<ManagerSidebarProps> = ({ 
  activeView, 
  onViewChange,
  collapsed = false,
  mobileOpen = false,
  onMobileToggle
}) => {
  const SidebarContent = (
    <aside className={`bg-white border-r border-gray-100 flex flex-col h-full transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Brand block */}
      <div className={`border-b border-gray-50 transition-all ${collapsed ? 'p-4 text-center' : 'p-8'}`}>
        <h2 className="font-serif text-xl font-bold text-primary tracking-tight">
          {collapsed ? 'N' : <>Nailssentials<span className="italic font-light">QC</span></>}
        </h2>
        {!collapsed && (
          <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-muted-foreground mt-1 opacity-60">
            Enterprise Suite
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              onViewChange(item.id);
              if (mobileOpen && onMobileToggle) onMobileToggle();
            }}
            className={`w-full flex items-center px-4 py-3 rounded-none text-[10px] uppercase tracking-widest font-bold transition-all group ${
              collapsed ? 'justify-center' : 'gap-3'
            } ${
              activeView === item.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={`h-4 w-4 shrink-0 stroke-[1.5] ${
              activeView === item.id ? 'text-white' : 'group-hover:text-primary'
            }`} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* System status footer */}
      <div className={`border-t border-gray-50 space-y-4 transition-all ${collapsed ? 'p-4' : 'p-6'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2'}`}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Settings className="h-4 w-4 text-primary animate-spin-slow" />
          </div>
          {!collapsed && (
            <div className="space-y-0.5 whitespace-nowrap">
              <p className="text-[9px] font-bold uppercase tracking-tight">System Status</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success-color animate-pulse shrink-0" />
                <span className="text-[8px] font-medium text-success-color uppercase">Live</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop & Tablet View */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0">
        {SidebarContent}
      </div>

      {/* Mobile View */}
      <Sheet open={mobileOpen} onOpenChange={onMobileToggle}>
        <SheetContent side="left" className="p-0 w-64 border-none">
          {SidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
};
