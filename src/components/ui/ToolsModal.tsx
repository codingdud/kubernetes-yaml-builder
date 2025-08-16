import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { Button } from "./button";

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose }) => {
  const [activeTool, setActiveTool] = useState<"base64" | "url" | "json" | "hash">("base64");
  const [base64Input, setBase64Input] = useState("");
  const [base64Output, setBase64Output] = useState("");
  const [base64Mode, setBase64Mode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const handleBase64Convert = () => {
    try {
      if (base64Mode === "encode") {
        setBase64Output(btoa(base64Input));
      } else {
        setBase64Output(atob(base64Input));
      }
    } catch {
      setBase64Output("❌ Invalid input for decoding");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-2/7 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-40 transform transition-transform duration-300 ${
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 text-sm">
        {[
          { key: "base64", label: "Base64" },
          { key: "url", label: "URL" },
          { key: "json", label: "JSON" },
          { key: "hash", label: "Hash" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTool(tab.key as any)}
            className={`flex-1 px-3 py-2 text-center ${
              activeTool === tab.key
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="p-3 overflow-y-auto h-[calc(100vh-100px)] text-sm">
        {activeTool === "base64" && (
          <div className="space-y-3">
            {/* Mode Switch */}
            <div className="flex gap-2">
              <Button
                variant={base64Mode === "encode" ? "default" : "outline"}
                size="sm"
                onClick={() => setBase64Mode("encode")}
              >
                Encode
              </Button>
              <Button
                variant={base64Mode === "decode" ? "default" : "outline"}
                size="sm"
                onClick={() => setBase64Mode("decode")}
              >
                Decode
              </Button>
            </div>

            {/* Input */}
            <textarea
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder={base64Mode === "encode" ? "Enter text..." : "Enter Base64..."}
            />

            <Button onClick={handleBase64Convert} className="w-full text-sm">
              {base64Mode === "encode" ? "Encode → Base64" : "Decode → Text"}
            </Button>

            {/* Output */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600 dark:text-gray-400">Output</span>
                {base64Output && (
                  <button
                    onClick={() => copyToClipboard(base64Output)}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs hover:underline"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <textarea
                value={base64Output}
                readOnly
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                rows={3}
                placeholder="Output..."
              />
            </div>
          </div>
        )}

        {activeTool === "url" && <p className="text-gray-500 dark:text-gray-400">🔧 URL Encoder/Decoder coming soon...</p>}
        {activeTool === "json" && <p className="text-gray-500 dark:text-gray-400">🔧 JSON Formatter coming soon...</p>}
        {activeTool === "hash" && <p className="text-gray-500 dark:text-gray-400">🔧 Hash Generator coming soon...</p>}
      </div>
    </div>
  );
};

export default ToolsModal;
