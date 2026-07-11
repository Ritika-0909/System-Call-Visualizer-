import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCategoryColor, getCategoryIcon } from '@/utils/syscallParser';
import { ChevronRight } from 'lucide-react';

export const SyscallList = ({ syscalls, onSyscallSelect, selectedSyscall }) => {
  if (syscalls.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No system calls detected. Upload code to analyze.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-4">Detected System Calls ({syscalls.length})</h3>
      {syscalls.map((syscall) => {
        const isSelected = selectedSyscall?.name === syscall.name;
        return (
          <Card
            key={syscall.name}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSyscallSelect(syscall)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryIcon(syscall.category)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{syscall.name}()</span>
                    <Badge variant="secondary">{syscall.count}x</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {syscall.category}
                    {syscall.lines && syscall.lines.length > 0 ? ` • lines: ${syscall.lines.join(', ')}` : ''}
                    {typeof syscall.firstSeenIndex === 'number' ? ` • first event #${syscall.firstSeenIndex}` : ''}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

