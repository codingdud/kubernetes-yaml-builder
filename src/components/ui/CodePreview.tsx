import React from 'react';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CodePreviewProps {
  yaml: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ yaml }) => {
  const downloadYAML = () => {
    if (!yaml || yaml === '# Add resources to generate YAML') return;
    
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kubernetes-resources.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-gray-900 dark:text-white">Generated YAML</CardTitle>
          {yaml && yaml !== '# Add resources to generate YAML' && (
            <Button
              onClick={downloadYAML}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono whitespace-pre-wrap">
          {yaml || '# Add resources to generate YAML'}
        </pre>
      </CardContent>
    </Card>
  );
};

export default CodePreview;