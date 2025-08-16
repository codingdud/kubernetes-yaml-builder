import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Textarea } from "./textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose }) => {

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

      {/* Content */}
      <div className="p-4 overflow-y-auto h-[calc(100vh-80px)]">
        <Tabs defaultValue="base64" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="base64">Base64</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="hash">Hash</TabsTrigger>
          </TabsList>
          
          <TabsContent value="base64" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Base64 Encoder/Decoder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Input ({base64Mode === "encode" ? "Plain Text" : "Base64"})
                  </label>
                  <Textarea
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    placeholder={base64Mode === "encode" ? "Enter text to encode..." : "Enter base64 to decode..."}
                    rows={4}
                  />
                </div>

                <Button onClick={handleBase64Convert} className="w-full">
                  {base64Mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
                </Button>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      Output ({base64Mode === "encode" ? "Base64" : "Plain Text"})
                    </label>
                    {base64Output && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(base64Output)}
                        className="h-8 px-2"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={base64Output}
                    readOnly
                    placeholder="Output will appear here..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="url">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">🔧 URL Encoder/Decoder coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="json">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">🔧 JSON Formatter coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hash">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">🔧 Hash Generator coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ToolsModal;
