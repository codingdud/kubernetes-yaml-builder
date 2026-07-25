import React, { useState } from 'react';
import type { ObjectFieldTemplateProps } from '@rjsf/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CollapsibleObjectFieldTemplate: React.FC<ObjectFieldTemplateProps> = (props) => {
  const { title, description, properties, uiSchema, required } = props;
  const options = ((uiSchema as any)?.['ui:options'] ?? {}) as Record<string, unknown>;
  const isCollapsible = Boolean(options.collapsible);
  const sectionTitle = (options.title as string) || title;
  const defaultCollapsed = Boolean(options.defaultCollapsed);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (!isCollapsible || !sectionTitle) {
    return (
      <div className="space-y-2">
        {sectionTitle && (
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {sectionTitle}{required && <span className="text-red-400 ml-0.5">*</span>}
          </p>
        )}
        {description && <p className="text-xs text-gray-400 mb-1">{description}</p>}
        {properties.map((prop) => <div key={prop.name}>{prop.content}</div>)}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-md mb-1.5">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left rounded-t-md"
      >
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          {sectionTitle}{required && <span className="text-red-400 ml-0.5">*</span>}
        </span>
        {collapsed
          ? <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />}
      </button>
      {!collapsed && (
        <div className="px-2.5 py-2 space-y-2">
          {description && <p className="text-xs text-gray-400">{description}</p>}
          {properties.map((prop) => <div key={prop.name}>{prop.content}</div>)}
        </div>
      )}
    </div>
  );
};

export default CollapsibleObjectFieldTemplate;
