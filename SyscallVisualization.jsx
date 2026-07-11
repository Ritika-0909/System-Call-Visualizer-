import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, User, Shield, ArrowRight } from 'lucide-react';

export const SyscallVisualization = ({ visualization }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState('beginner');

  const step = visualization.steps[currentStep];
  const progress = ((currentStep + 1) / visualization.steps.length) * 100;

  const getModeColor = (mode) => {
    switch (mode) {
      case 'user':
        return 'bg-userMode/10 border-userMode text-userMode';
      case 'kernel':
        return 'bg-kernelMode/10 border-kernelMode text-kernelMode';
      case 'transition':
        return 'bg-dataTransfer/10 border-dataTransfer text-dataTransfer';
      default:
        return 'bg-muted border-muted-foreground text-foreground';
    }
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'kernel':
        return <Shield className="w-4 h-4" />;
      case 'transition':
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold font-mono">{visualization.syscall}()</h2>
            <p className="text-muted-foreground">{visualization.summary}</p>
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v)}>
            <TabsList>
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {visualization.steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Step */}
      <Card className="p-6 animate-fade-in">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className={`${getModeColor(step.mode)} border px-3 py-1`}>
              <span className="flex items-center gap-2">
                {getModeIcon(step.mode)}
                {step.mode.toUpperCase()}
              </span>
            </Badge>
            <h3 className="text-xl font-semibold">{step.title}</h3>
          </div>

          <p className="text-lg leading-relaxed">
            {step.description[viewMode]}
          </p>

          {/* Registers */}
          {step.registers && (
            <Card className="p-4 bg-registerBg border-registerValue">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>📊</span> CPU Registers
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(step.registers).map(([reg, value]) => (
                  <div key={reg} className="flex items-center gap-2 font-mono text-sm">
                    <span className="font-bold text-registerValue">{reg}:</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Stack */}
          {step.stack && (
            <Card className="p-4 bg-stackBg border-stackValue">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>📚</span> Kernel Stack
              </h4>
              <div className="space-y-2 font-mono text-sm">
                {step.stack.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                    <span className="text-stackValue font-bold">[{i}]</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Structures */}
          {step.structures && (
            <Card className="p-4 bg-accent">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>🏗️</span> Kernel Data Structures
              </h4>
              <div className="space-y-3">
                {step.structures.map((struct, i) => (
                  <div key={i} className="space-y-2">
                    <p className="font-mono font-bold text-primary">{struct.name}</p>
                    <div className="pl-4 space-y-1 font-mono text-sm">
                      {Object.entries(struct.fields).map(([field, value]) => (
                        <div key={field} className="flex gap-2">
                          <span className="text-muted-foreground">{field}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {visualization.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep ? 'bg-primary w-8' : 'bg-muted hover:bg-muted-foreground'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={() => setCurrentStep(Math.min(visualization.steps.length - 1, currentStep + 1))}
          disabled={currentStep === visualization.steps.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

