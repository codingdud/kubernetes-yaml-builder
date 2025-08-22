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
      className={`fixed top-0 left-0 h-full w-2/7 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-[100] transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Developer Tools</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
        <Tabs defaultValue="base64" className="w-full">
          <TabsList className="grid w-full grid-cols-5"> {/* Changed grid-cols to 5 */}
            <TabsTrigger value="base64">Base64</TabsTrigger>
            <TabsTrigger value="json">JSON/YAML</TabsTrigger>
            <TabsTrigger value="uuidUlid">UUID/ULID</TabsTrigger>
            <TabsTrigger value="timestamp">Timestamp</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger> {/* New Trigger */}
          </TabsList>
          
          <TabsContent value="base64" className="space-y-4">
            <Base64Tool />
          </TabsContent>
          
          <TabsContent value="json" className="space-y-4">
            <JsonTool />
          </TabsContent>

          <TabsContent value="uuidUlid" className="space-y-4">
            <UuidUlidTool />
          </TabsContent>

          <TabsContent value="timestamp" className="space-y-4">
            <TimestampTool />
          </TabsContent>

          <TabsContent value="url" className="space-y-4"> {/* New Content */}
            <UrlTool />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ToolsModal;