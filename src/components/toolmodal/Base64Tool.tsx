import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const Base64Tool: React.FC = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    try {
      if (activeTab === "encode") {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch {
      setOutput("❌ Invalid input for decoding");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Base64 Encoder/Decoder</CardTitle>
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
          <TabsContent value="encode" className="space-y-4" forceMount>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Input ({activeTab === "encode" ? "Plain Text" : "Base64"})
              </label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeTab === "encode"
                    ? "Enter text to encode..."
                    : "Enter base64 to decode..."
                }
                rows={4}
              />
            </div>

            <Button onClick={handleConvert} className="w-full">
              {activeTab === "encode"
                ? "Encode to Base64"
                : "Decode from Base64"}
            </Button>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Output ({activeTab === "encode" ? "Base64" : "Plain Text"})
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
                value={output}
                readOnly
                placeholder="Output will appear here..."
                rows={4}
              />
            </div>
          </TabsContent>
          <TabsContent value="decode" className="space-y-4" forceMount>
            {/* Identical to encode tab, shared states handle it */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Base64Tool;
