import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"; // Import Tabs components
import * as yaml from 'js-yaml';

const JsonTool: React.FC = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [yamlOutput, setYamlOutput] = useState("");

  const [yamlInput, setYamlInput] = useState("");
  const [jsonOutputFromYaml, setJsonOutputFromYaml] = useState("");

  const handleJsonToYamlConvert = () => {
    try {
      const jsonObject = JSON.parse(jsonInput);
      setYamlOutput(yaml.dump(jsonObject));
    } catch (e: any) {
      setYamlOutput(`❌ Invalid JSON input: ${e.message}`);
    }
  };

  const handleYamlToJsonConvert = () => {
    try {
      const jsonObject = yaml.load(yamlInput);
      setJsonOutputFromYaml(JSON.stringify(jsonObject, null, 2));
    } catch (e: any) {
      setJsonOutputFromYaml(`❌ Invalid YAML input: ${e.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">JSON/YAML Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="jsonToYaml" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jsonToYaml">JSON to YAML</TabsTrigger>
            <TabsTrigger value="yamlToJson">YAML to JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="jsonToYaml" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">JSON Input</label>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Enter JSON here..."
                rows={8}
              />
            </div>
            <Button onClick={handleJsonToYamlConvert} className="w-full">
              Convert to YAML
            </Button>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">YAML Output</label>
                {yamlOutput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(yamlOutput)}
                    className="h-8 px-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                )}
              </div>
              <Textarea
                value={yamlOutput}
                readOnly
                placeholder="Converted YAML will appear here..."
                rows={8}
              />
            </div>
          </TabsContent>

          <TabsContent value="yamlToJson" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">YAML Input</label>
              <Textarea
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
                placeholder="Enter YAML here..."
                rows={8}
              />
            </div>
            <Button onClick={handleYamlToJsonConvert} className="w-full">
              Convert to JSON
            </Button>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">JSON Output</label>
                {jsonOutputFromYaml && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(jsonOutputFromYaml)}
                    className="h-8 px-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                )}
              </div>
              <Textarea
                value={jsonOutputFromYaml}
                readOnly
                placeholder="Converted JSON will appear here..."
                rows={8}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JsonTool;