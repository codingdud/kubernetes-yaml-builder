import React, { useState } from 'react';
import type { FieldTemplateProps } from '@rjsf/utils';
import { Templates } from '@rjsf/shadcn';
import { ChevronDown, ChevronRight } from 'lucide-react';

const DefaultFieldTemplate = Templates.FieldTemplate!;

const CollapsibleFieldTemplate: React.FC<FieldTemplateProps> = (props) => {
  const { uiSchema, children, errors, help, hidden, required, label } = props;
  const options = ((uiSchema as any)?.['ui:options'] ?? {}) as Record<string, unknown>;

  // ObjectFieldTemplate handles plain object fields — only intercept widget fields
  // that explicitly request collapsible behaviour via ui:widget + ui:options.collapsible
  const hasWidget = Boolean((uiSchema as any)?.['ui:widget']);
  const isCollapsible = Boolean(options.collapsible) && hasWidget;

  const sectionTitle = (options.title as string) || label;
  const defaultCollapsed = Boolean(options.defaultCollapsed);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (!isCollapsible) {
    return <DefaultFieldTemplate {...props} />;
  }

  if (hidden) return <div className="hidden">{children}</div>;

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
        <div className="px-2.5 py-2 space-y-1">
          {children}
          {errors}
          {help}
        </div>
      )}
    </div>
  );
};

export default CollapsibleFieldTemplate;
