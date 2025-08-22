import React, { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { ulid } from 'ulid';
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";

const UuidUlidTool: React.FC = () => {
  const [generatedId, setGeneratedId] = useState("");
  const [copied, setCopied] = useState(false);

  const generateUuid = () => {
    setGeneratedId(uuidv4());
    setCopied(false); // Reset copied state
  };

  const generateUlid = () => {
    setGeneratedId(ulid());
    setCopied(false); // Reset copied state
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">UUID/ULID Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={generateUuid}>Generate UUID</Button>
          <Button onClick={generateUlid}>Generate ULID</Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Generated ID</label>
          <div className="flex items-center space-x-2">
            <Textarea
              value={generatedId}
              readOnly
              placeholder="Click a button to generate an ID..."
              rows={2}
              className="flex-grow"
            />
            {generatedId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(generatedId)}
                className="h-8 px-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UuidUlidTool;