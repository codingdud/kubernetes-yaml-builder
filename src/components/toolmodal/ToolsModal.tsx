import React from "react";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Base64Tool from "./Base64Tool";
import JsonTool from "./JsonTool";
import UuidUlidTool from "./UuidUlidTool";
import TimestampTool from "./TimestampTool";
import UrlTool from "./UrlTool"; // New import

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-96 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-[100] transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dev Tools</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto h-[calc(100vh-88px)]">
        <Tabs defaultValue="base64" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="base64" className="text-sm">Base64</TabsTrigger>
            <TabsTrigger value="json" className="text-sm">JSON/YAML</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="uuidUlid" className="text-sm">UUID/ULID</TabsTrigger>
            <TabsTrigger value="timestamp" className="text-sm">Timestamp</TabsTrigger>
            <TabsTrigger value="url" className="text-sm">URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="base64" className="mt-6">
            <Base64Tool />
          </TabsContent>
          
          <TabsContent value="json" className="mt-6">
            <JsonTool />
          </TabsContent>

          <TabsContent value="uuidUlid" className="mt-6">
            <UuidUlidTool />
          </TabsContent>

          <TabsContent value="timestamp" className="mt-6">
            <TimestampTool />
          </TabsContent>

          <TabsContent value="url" className="mt-6">
            <UrlTool />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ToolsModal;