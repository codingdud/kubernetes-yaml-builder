import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

const UrlTool: React.FC = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleEncodeURIComponent = () => {
    try {
      setOutput(encodeURIComponent(input));
    } catch (e: any) {
      setOutput(`❌ Error: ${e.message}`);
    }
  };

  const handleEncodeURI = () => {
    try {
      setOutput(encodeURI(input));
    } catch (e: any) {
      setOutput(`❌ Error: ${e.message}`);
    }
  };

  const handleDecodeURIComponent = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch (e: any) {
      setOutput(`❌ Error: ${e.message}`);
    }
  };

  const handleDecodeURI = () => {
    try {
      setOutput(decodeURI(input));
    } catch (e: any) {
      setOutput(`❌ Error: ${e.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">URL Encoder/Decoder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="encode" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode">Encode</TabsTrigger>
            <TabsTrigger value="decode">Decode</TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Text</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to encode..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEncodeURIComponent} className="w-full">Encode URI Component</Button>
              <Button onClick={handleEncodeURI} className="w-full">Encode URI</Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Output</label>
                {output && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(output)}
                    className="h-8 px-2"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                )}
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder="Encoded output will appear here..."
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="decode" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Text</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to decode..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDecodeURIComponent} className="w-full">Decode URI Component</Button>
              <Button onClick={handleDecodeURI} className="w-full">Decode URI</Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Output</label>
                {output && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(output)}
                    className="h-8 px-2"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                )}
              </div>
              <Textarea
                value={output}
                readOnly
                placeholder="Decoded output will appear here..."
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UrlTool;