import React from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import yamlExamples from "../../data/yamlExamples.json";

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
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">YAML Examples</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
        <div className="space-y-4">
          {Object.entries(yamlExamples).map(([type, yaml]) => (
            <Card key={type}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{type}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs font-mono">
                  <code>{yaml}</code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocsModal;
