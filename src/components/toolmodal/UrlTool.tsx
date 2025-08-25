import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const UrlTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error("Clipboard copy failed");
    }
  };

  // Auto-detect if the input is a full URI
  const isFullURI = (str: string): boolean => {
    // A simple regex to check for a URI scheme like "http:", "https:", etc.
    return /^[a-z][a-z0-9+.-]*:/.test(str.trim());
  };

  const runOperation = () => {
    try {
      let result = "";
      const isUri = isFullURI(input);

      if (activeTab === "encode") {
        result = isUri ? encodeURI(input) : encodeURIComponent(input);
      } else {
        result = isUri ? decodeURI(input) : decodeURIComponent(input);
      }
      setOutput(result);
    } catch (error) {
      if (error instanceof URIError) {
        setOutput(`❌ Invalid input for decoding: ${error.message}`);
      } else {
        setOutput("An unexpected error occurred.");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">URL Encoder/Decoder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs
          defaultValue="encode"
          className="w-full"
          onValueChange={(val) => {
            setActiveTab(val as "encode" | "decode");
            setInput("");
            setOutput("");
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>

          {/* Shared content */}
          <TabsContent value="encode" className="space-y-4" forceMount>
            <div className="space-y-2">
              <label htmlFor="input" className="text-sm font-medium">
                Input Text
              </label>
              <Textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter text to ${activeTab}...`}
                rows={4}
              />
            </div>

            <Button onClick={runOperation} className="w-full">
              {activeTab === "encode" ? "Encode" : "Decode"}
            </Button>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="output" className="text-sm font-medium">
                  Output
                </label>
                {output && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(output)}
                    className="h-8 px-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <Textarea
                id="output"
                value={output}
                readOnly
                placeholder={`${activeTab}d output will appear here...`}
                rows={4}
              />
            </div>
          </TabsContent>

          {/* Just reuse same UI for decode */}
          <TabsContent value="decode" className="space-y-4" forceMount>
            {/* identical to encode tab, shared states handle it */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UrlTool;