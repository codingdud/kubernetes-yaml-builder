import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CodePreviewProps {
  yaml: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ yaml }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Generated YAML</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto text-sm font-mono whitespace-pre-wrap">
          {yaml || '# Add resources to generate YAML'}
        </pre>
      </CardContent>
    </Card>
  );
};

export default CodePreview;