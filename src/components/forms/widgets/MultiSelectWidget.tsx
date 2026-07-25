import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { type WidgetProps } from '@rjsf/utils';
import { Check, ChevronDown, X } from 'lucide-react';

const MultiSelectWidget = (props: WidgetProps) => {
  const { value = [], disabled, onChange, options, rawErrors } = props;
  const { enumOptions = [] } = options;
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(value) ? value : []
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasError = rawErrors && rawErrors.length > 0;

  // Sync from controlled formData prop (external reset / initial load)
  useEffect(() => {
    setSelectedValues(Array.isArray(value) ? value : []);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const inContainer = containerRef.current?.contains(e.target as Node);
      const inDropdown = dropdownRef.current?.contains(e.target as Node);
      if (!inContainer && !inDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        maxHeight: '240px',
        overflowY: 'auto',
      });
    }
    setIsOpen(o => !o);
  };

  const toggleOption = (optionValue: string) => {
    const newValue = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    setSelectedValues(newValue);
    onChange(newValue);
  };

  const removeOption = (optionValue: string) => {
    const newValue = selectedValues.filter(v => v !== optionValue);
    setSelectedValues(newValue);
    onChange(newValue);
  };

  const getSelectedLabels = () =>
    selectedValues.map(val => enumOptions.find(o => o.value === val)?.label ?? val);

  const dropdown = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
        >
          {enumOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
              No options available
            </div>
          ) : (
            enumOptions.map(({ value: optionValue, label }) => {
              const isSelected = selectedValues.includes(optionValue);
              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(optionValue);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <span className="text-gray-900 dark:text-white">{label}</span>
                  {isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={containerRef} className="w-full relative">
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {getSelectedLabels().map((label, index) => (
            <span
              key={selectedValues[index]}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md"
            >
              {label}
              <button
                type="button"
                onClick={() => removeOption(selectedValues[index])}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={openDropdown}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between transition-all duration-200 ${
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
      >
        <span className="text-gray-500 dark:text-gray-400">
          {selectedValues.length === 0 ? 'Select options...' : `${selectedValues.length} selected`}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdown}

      {hasError && (
        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
          {rawErrors.join(', ')}
        </div>
      )}
    </div>
  );
};

export default MultiSelectWidget;
