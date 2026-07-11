import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCode, Loader2, Play, Upload } from 'lucide-react';

export const CodeEditor = ({ value, onChange, placeholder, onRun, onUpload, isRunning }) => {
  const fileInputRef = useRef(null);

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && onUpload) {
      onUpload(file);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-editorBg p-4 flex flex-wrap items-center justify-between gap-3 border-b border-border">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-editorFg" />
          <span className="text-editorFg font-medium">C/Open-Source Program</span>
        </div>
        <div className="flex items-center gap-2">
          {onUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".c,.h,.cpp,.cc"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="outline" size="sm" onClick={handleTriggerUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </>
          )}
          {onRun && (
            <Button size="sm" onClick={onRun} disabled={isRunning}>
              {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              {isRunning ? 'Analyzing…' : 'Run Analysis'}
            </Button>
          )}
        </div>
      </div>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Paste or type your C/C++ code here...'}
          className="code-font min-h-[400px] bg-editorBg text-editorFg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
          spellCheck={false}
        />
      </div>
    </Card>
  );
};

