'use client';

import { LayoutGrid, List } from 'lucide-react';

type ViewMode = 'grid' | 'compact';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-[#F9FAFB] rounded-lg p-1 border border-[#E5E7EB] shadow-sm">
      <button
        onClick={() => onViewChange('compact')}
        className={`p-2 rounded transition-colors ${
          view === 'compact'
            ? 'bg-white text-[#111111] shadow-sm'
            : 'text-[#111111]/70 hover:text-[#111111] hover:bg-white/50'
        }`}
        title="Compact View"
        type="button"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded transition-colors ${
          view === 'grid'
            ? 'bg-white text-[#111111] shadow-sm'
            : 'text-[#111111]/70 hover:text-[#111111] hover:bg-white/50'
        }`}
        title="Grid View"
        type="button"
      >
        <LayoutGrid size={18} />
      </button>
    </div>
  );
}

