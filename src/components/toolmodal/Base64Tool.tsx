import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";

const Base64Tool: React.FC = () => {
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
            placeholder={
              base64Mode === "encode"
                ? "Enter text to encode..."
                : "Enter base64 to decode..."
            }
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
  );
};

export default Base64Tool;