import React from "react";
import { X } from "lucide-react";
import yamlExamples from "@/data/yamlExamples.json";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-1/3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-40 overflow-hidden transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          YAML Examples
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Close"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-2 overflow-y-auto h-[calc(100vh-40px)]">
        <div className="flex flex-col gap-3">
          {Object.entries(yamlExamples).map(([type, yaml]) => (
            <div
              key={type}
              className="border border-gray-200 dark:border-gray-600 rounded overflow-hidden"
            >
              <div className="bg-gray-50 dark:bg-gray-800 px-2 py-1 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-xs font-medium text-gray-900 dark:text-white">
                  {type}
                </h3>
              </div>
              <pre className="bg-gray-900 dark:bg-gray-950 text-green-400 dark:text-green-300 p-2 overflow-x-auto text-xs leading-snug">
                <code>{yaml}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocsModal;
