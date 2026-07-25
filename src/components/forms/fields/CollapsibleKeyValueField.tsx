import React, { useState } from 'react';
import type { FieldProps } from '@rjsf/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import KeyValueWidget from '../widgets/KeyValueWidget';

const CollapsibleKeyValueField: React.FC<FieldProps> = (props) => {
  const { uiSchema, formData, onChange, idSchema, required, formContext, schema, disabled, readonly, rawErrors, registry } = props;
  const options = ((uiSchema as any)?.['ui:options'] ?? {}) as Record<string, unknown>;
  const rawId = idSchema.$id.split('_root_').pop() ?? idSchema.$id;
  const title = (options.title as string) || rawId.replace(/_/g, ' ');
  const defaultCollapsed = Boolean(options.defaultCollapsed);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-md mb-1.5">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left rounded-t-md"
      >
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
          {title}{required && <span className="text-red-400 ml-0.5">*</span>}
        </span>
        {collapsed
          ? <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0" />}
      </button>
      {!collapsed && (
        <div className="px-2.5 py-2">
          <KeyValueWidget
            {...({
              value: formData ?? {},
              onChange,
              id: idSchema.$id,
              formContext,
              label: '',
              schema,
              uiSchema: uiSchema ?? {},
              disabled: disabled ?? false,
              readonly: readonly ?? false,
              required: required ?? false,
              autofocus: false,
              options: {},
              rawErrors: rawErrors ?? [],
              multiple: false,
              onBlur: () => {},
              onFocus: () => {},
              placeholder: '',
              registry,
            } as any)}
          />
        </div>
      )}
    </div>
  );
};

export default CollapsibleKeyValueField;
