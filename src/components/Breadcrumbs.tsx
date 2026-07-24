import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  portalName: string;
  activeTab: string;
  tabLabel?: string;
  onNavigateHome?: () => void;
}

export default function Breadcrumbs({
  portalName,
  activeTab,
  tabLabel,
  onNavigateHome,
}: BreadcrumbsProps) {
  const formattedTab = tabLabel || activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ');

  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 py-1.5 px-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md w-fit">
      <button 
        onClick={onNavigateHome}
        className="flex items-center gap-1 hover:text-[#38bdf8] transition-colors cursor-pointer"
        title="Home"
      >
        <Home className="w-3.5 h-3.5 text-slate-400" />
      </button>
      
      <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
      
      <span className="text-slate-300 font-mono text-[11px]">{portalName}</span>

      <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

      <span className="font-bold text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/20 px-2 py-0.5 rounded-md text-[11px] font-mono capitalize">
        {formattedTab}
      </span>
    </nav>
  );
}
