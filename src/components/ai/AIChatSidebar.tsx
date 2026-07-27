import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import ChatPanel from './ChatPanel';

interface AIChatSidebarProps {
  onCollapseChange: (collapsed: boolean) => void;
  width: number;
  onWidthChange: (width: number) => void;
}

export function AIChatSidebar({ onCollapseChange, width, onWidthChange }: AIChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStartX.current;
      onWidthChange(Math.max(280, Math.min(600, dragStartWidth.current + dx)));
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [onWidthChange]);

  const onDragHandleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = width;
    e.preventDefault();
  }, [width]);

  const toggleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapseChange(collapsed);
  };

  if (isCollapsed) {
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={() => toggleCollapse(false)}
          className="p-3 bg-blue-600 dark:bg-blue-700 text-white rounded-r-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-1"
          title="Open AI Chat"
        >
          <MessageSquare className="h-5 w-5" />
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0 h-full"
        style={{ width }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-sm text-gray-900 dark:text-white">AI Agent</span>
          </div>
          <button
            onClick={() => toggleCollapse(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Collapse AI Chat"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatPanel />
        </div>
      </div>
      <div
        onMouseDown={onDragHandleMouseDown}
        className="w-1 flex-shrink-0 bg-gray-200 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-col-resize transition-colors"
      />
    </>
  );
}
