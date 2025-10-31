import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";

import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import yamlExamples from "../../data/yamlExamples.json";
import { type YamlExamples } from "../../types/yamlExamples";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const typedYamlExamples: YamlExamples = yamlExamples;
  const resourceTypes = Object.keys(typedYamlExamples);
  const [selectedResourceType, setSelectedResourceType] = useState<string>(resourceTypes[0] || "");
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const copyToClipboard = (text: string, exampleName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(exampleName);
    setTimeout(() => setCopiedExample(null), 1500);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-2/3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-[100] overflow-hidden transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">YAML Examples</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 h-[calc(100vh-88px)] overflow-y-auto">
        {/* Resource Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Select Resource Type
          </label>
          <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a resource type" />
            </SelectTrigger>
            <SelectContent>
              {resourceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Examples */}
        {selectedResourceType && typedYamlExamples[selectedResourceType] && (
          <div className="grid gap-6">
            {Object.entries(typedYamlExamples[selectedResourceType]).map(([exampleName, yamlContent]) => (
              <div key={exampleName} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{exampleName}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(yamlContent as string, exampleName)}
                    className="h-8 px-3"
                  >
                    {copiedExample === exampleName ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copiedExample === exampleName ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="p-4">
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200">
                    <code>{yamlContent as string}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocsModal;