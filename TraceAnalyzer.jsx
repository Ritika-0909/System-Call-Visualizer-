import { useCallback, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CodeEditor } from '@/components/CodeEditor';
import { SyscallList } from '@/components/SyscallList';
import { SyscallVisualization } from '@/components/SyscallVisualization';
import { SyscallAnalytics } from '@/components/SyscallAnalytics';
import { GlossaryPanel } from '@/components/GlossaryPanel';
import { SyscallTimeline } from '@/components/SyscallTimeline';
import { getSyscallCategory } from '@/utils/syscallParser';
import { getSyscallVisualization } from '@/utils/syscallVisualizations';
import { toast } from 'sonner';
import { Download, ExternalLink, FileCode2, Terminal, TriangleAlert } from 'lucide-react';


// ------------------------------------------------------
// ✔ FIXED: Only ONE definition of DEFAULT_TIMEOUT_LABEL
// ------------------------------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const ANALYSIS_TIMEOUT_VALUE = Number(import.meta.env.VITE_ANALYSIS_TIMEOUT ?? '');
const DEFAULT_TIMEOUT_LABEL = `${Number.isFinite(ANALYSIS_TIMEOUT_VALUE) && ANALYSIS_TIMEOUT_VALUE > 0 ? ANALYSIS_TIMEOUT_VALUE : 5}s`;
// ------------------------------------------------------


const EXAMPLE_CODE = `#include <stdio.h>
#include <unistd.h>

int main(void) {
    const char *msg = "Hello from Syscall Vista!\\n";
    write(1, msg, 27);
    return 0;
}`;

const CATEGORY_FILTERS = [
  { label: 'All categories', value: 'all' },
  { label: 'File & I/O', value: 'file' },
  { label: 'Process', value: 'process' },
  { label: 'Memory', value: 'memory' },
  { label: 'Network', value: 'network' },
  { label: 'Other', value: 'other' },
];

export const TraceAnalyzer = () => {
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedSyscall, setSelectedSyscall] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const mapSummaryToList = useCallback(
  (
    summary,
    events = []
  ) => {
    const safeSummary = summary ?? {};  // prevents crash

    return Object.entries(safeSummary)
      .map(([name, count]) => {
        const firstEvent = events.find((event) => event.name === name);
        return {
          name,
          count,
          category: getSyscallCategory(name),
          firstSeenIndex: firstEvent?.index ?? -1,
        };
      })
      .sort((a, b) => b.count - a.count);
  },
  []
);


  const syscalls = useMemo(() => {
    if (!analysis) return [];
    return mapSummaryToList(analysis.summary, analysis.events);
  }, [analysis, mapSummaryToList]);

  const filteredSyscalls = useMemo(() => {
    if (categoryFilter === 'all') return syscalls;
    return syscalls.filter((item) => item.category === categoryFilter);
  }, [syscalls, categoryFilter]);

  const totalCallCount = useMemo(() => syscalls.reduce((sum, item) => sum + item.count, 0), [syscalls]);

  const currentVisualization = useMemo(() => {
    if (!selectedSyscall) return null;
    return getSyscallVisualization(selectedSyscall.name);
  }, [selectedSyscall]);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error('Please provide C code to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('code', code);

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error || 'Analysis failed';
        setErrorMessage(message);
        toast.error(message);
        return;
      }

      setAnalysis(payload);
      const resultSyscalls = mapSummaryToList(payload.summary, payload.events);
      setSelectedSyscall(resultSyscalls[0] ?? null);
      setSelectedEvent(null);
      setActiveTab('summary');
      toast.success(`Captured ${payload.sequence.length} system call events.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(message);
      toast.error('Unable to reach backend. Is the Flask server running?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result;
      setCode(contents);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleSyscallSelect = (syscall) => {
    setSelectedSyscall(syscall);
    if (analysis) {
      const match = analysis.events.find((event) => event.name === syscall.name);
      setSelectedEvent(match ?? null);
    }
    setActiveTab('visualization');
  };

  const handleLoadExample = () => {
    setCode(EXAMPLE_CODE);
    toast.success('Example code loaded!');
  };

  const handleExport = () => {
    if (!analysis) {
      toast.info('Run an analysis before exporting.');
      return;
    }

    const report = {
      id: analysis.id,
      generatedAt: new Date().toISOString(),
      summary: analysis.summary,
      sequence: analysis.sequence,
      stdout: analysis.stdout,
      stderr: analysis.stderr,
      source: analysis.source,
    };

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Syscall Vista Report – ${report.id}</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; margin: 3rem; background: #f8fafc; color: #0f172a; }
      h1 { color: #2563eb; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 2rem; }
      th, td { border: 1px solid #e2e8f0; padding: 0.6rem; text-align: left; }
      th { background: #dbeafe; }
      pre { background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 0.75rem; overflow-x: auto; }
      .badge { display: inline-block; background: #dbeafe; color: #1e3a8a; padding: 0.25rem 0.75rem; border-radius: 9999px; margin: 0.2rem; }
    </style>
  </head>
  <body>
    <h1>System Call Analysis Report</h1>
    <p><strong>Report ID:</strong> ${report.id}</p>
    <p><strong>Generated:</strong> ${report.generatedAt}</p>
    <h2>Summary</h2>
    <table>
      <thead>
        <tr><th>Syscall</th><th>Count</th></tr>
      </thead>
      <tbody>
        ${Object.entries(report.summary)
          .map(([name, count]) => `<tr><td>${name}()</td><td>${count}</td></tr>`)
          .join('')}
      </tbody>
    </table>
    <h2>Sequence</h2>
    <p>${report.sequence.map((name) => `<span class="badge">${name}()</span>`).join('')}</p>
    <h2>Program Output</h2>
    <h3>stdout</h3>
    <pre>${(report.stdout || '<empty>').replace(/</g, '&lt;')}</pre>
    <h3>stderr</h3>
    <pre>${(report.stderr || '<empty>').replace(/</g, '&lt;')}</pre>
    <h2>Source</h2>
    <pre>${report.source.replace(/</g, '&lt;')}</pre>
  </body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `syscall-vista-report-${analysis.id}.html`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exported report as HTML.');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Terminal className="w-8 h-8 text-primary" />
                Syscall Vista Trace Analyzer
              </h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                Compile real C programs, trace their Linux syscalls with strace, and step through beginner or advanced
                kernel visualizations.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" onClick={handleLoadExample}>
                <FileCode2 className="w-4 h-4 mr-2" />
                Load Example
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={!analysis}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button asChild variant="ghost">
                <a
                  href="https://man7.org/linux/man-pages/man2/syscalls.2.html"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Linux syscall docs
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Analysis error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 flex flex-wrap">
                <TabsTrigger value="editor">Code Editor</TabsTrigger>
                <TabsTrigger value="summary" disabled={!analysis}>
                  Trace Summary
                </TabsTrigger>
                <TabsTrigger value="analytics" disabled={!analysis}>
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="visualization" disabled={!currentVisualization}>
                  Visualization
                </TabsTrigger>
                <TabsTrigger value="timeline" disabled={!analysis}>
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  onRun={handleAnalyze}
                  onUpload={handleFileUpload}
                  isRunning={isAnalyzing}
                  placeholder="Paste or upload a C program to trace its Linux syscalls..."
                />
                <div className="flex flex-wrap items-center justify-between mt-4 gap-3">
                  <p className="text-sm text-muted-foreground">
                    The analyzer compiles and traces your program inside a sandboxed subprocess (timeout {DEFAULT_TIMEOUT_LABEL}).
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Filter results</span>
                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_FILTERS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="summary" className="space-y-6">
                {analysis ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-6">
                        <p className="text-sm text-muted-foreground mb-1">Syscall events</p>
                        <p className="text-4xl font-bold text-primary">{analysis.sequence.length}</p>
                      </Card>
                      <Card className="p-6">
                        <p className="text-sm text-muted-foreground mb-1">Unique syscalls</p>
                        <p className="text-4xl font-bold text-kernelMode">{syscalls.length}</p>
                      </Card>
                      <Card className="p-6">
                        <p className="text-sm text-muted-foreground mb-1">Total invocations</p>
                        <p className="text-4xl font-bold text-dataTransfer">{totalCallCount}</p>
                      </Card>
                    </div>

                    <SyscallList
                      syscalls={filteredSyscalls}
                      onSyscallSelect={handleSyscallSelect}
                      selectedSyscall={selectedSyscall ?? undefined}
                    />

                    {selectedEvent && (
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold font-mono">{selectedEvent.name}()</h3>
                            <p className="text-sm text-muted-foreground">
                              Event #{selectedEvent.index}
                              {selectedEvent.timestamp !== null ? ` · ${selectedEvent.timestamp.toFixed(6)}s` : ''}
                            </p>
                          </div>
                          {selectedEvent.result && (
                            <Badge variant="secondary" className="font-mono">
                              result: {selectedEvent.result}
                            </Badge>
                          )}
                        </div>
                        <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">{selectedEvent.raw}</pre>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="p-12 text-center text-muted-foreground">Run an analysis to populate results.</Card>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                {analysis ? (
                  <SyscallAnalytics syscalls={filteredSyscalls} />
                ) : (
                  <Card className="p-12 text-center text-muted-foreground">
                    Analytics become available after tracing a program.
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="visualization">
                {currentVisualization ? (
                  <SyscallVisualization visualization={currentVisualization} />
                ) : (
                  <Card className="p-12 text-center text-muted-foreground space-y-2">
                    <p>Select a syscall from the summary tab to explore its internals.</p>
                    <p>Visualizations cover open, read, write, close, fork, execve, wait, and exit.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="timeline">
                {analysis ? (
                  <SyscallTimeline
                    events={analysis.events}
                    activeFilter={selectedSyscall?.name ?? 'all'}
                    onSelect={(event) => {
                      setSelectedEvent(event);
                      const info = syscalls.find((item) => item.name === event.name);
                      if (info) {
                        setSelectedSyscall(info);
                      }
                    }}
                  />
                ) : (
                  <Card className="p-12 text-center text-muted-foreground">
                    Timeline will appear after system calls are captured.
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <GlossaryPanel />
            {analysis && (
              <Card className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Program output</h3>
                  <p className="text-sm text-muted-foreground">stdout and stderr captured during execution.</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-muted-foreground">stdout</h4>
                  <pre className="bg-muted mt-2 p-2 rounded font-mono text-xs whitespace-pre-wrap">
                    {analysis.stdout || '<empty>'}
                  </pre>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-muted-foreground">stderr</h4>
                  <pre className="bg-muted mt-2 p-2 rounded font-mono text-xs whitespace-pre-wrap">
                    {analysis.stderr || '<empty>'}
                  </pre>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

