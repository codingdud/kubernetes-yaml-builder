import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CodePreview from '@/components/ui/CodePreview';
import resourceRegistry from '@/config/resourceRegistry';

interface SidebarProps {
  onAddNode: (kind: keyof typeof resourceRegistry) => void;
  yaml: string;
  onCollapseChange: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddNode, yaml, onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapseChange(collapsed);
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={() => toggleCollapse(false)}
          className="p-3 bg-blue-600 dark:bg-gray-700 text-white rounded-l-lg shadow-lg hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
          title="Expand sidebar"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-1/4 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-auto relative">
      <div className="p-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Resources</h3>
          <button
            onClick={() => toggleCollapse(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Collapse sidebar"
          >
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.keys(resourceRegistry).map((kind) => (
            <Button 
              key={kind} 
              onClick={() => onAddNode(kind as keyof typeof resourceRegistry)} 
              className="text-xs px-2 py-1"
              size="sm"
            >
              Add {kind}
            </Button>
          ))}
        </div>
        <CodePreview yaml={yaml} />
      </div>
    </div>
  );
};

export default Sidebar;