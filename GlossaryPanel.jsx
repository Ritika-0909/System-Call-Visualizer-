import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book } from 'lucide-react';

const glossaryTerms = [
  {
    term: 'User Mode',
    definition: 'The restricted execution mode where normal applications run. Programs in user mode have limited access to hardware and cannot directly access kernel memory.',
    icon: '👤',
  },
  {
    term: 'Kernel Mode',
    definition: 'Privileged execution mode where the operating system kernel runs with full access to hardware, memory, and CPU instructions.',
    icon: '🛡️',
  },
  {
    term: 'System Call',
    definition: 'A programmatic way for a user program to request services from the operating system kernel. It triggers a controlled transition from user mode to kernel mode.',
    icon: '📞',
  },
  {
    term: 'Register',
    definition: 'Small, extremely fast storage locations in the CPU used to hold data, addresses, or instructions during execution.',
    icon: '📊',
  },
  {
    term: 'syscall Instruction',
    definition: 'A special CPU instruction that causes the processor to switch from user mode to kernel mode, transferring control to the operating system.',
    icon: '⚡',
  },
  {
    term: 'sys_call_table',
    definition: 'A kernel data structure (array) that maps system call numbers to their corresponding handler functions.',
    icon: '🗂️',
  },
  {
    term: 'VFS (Virtual File System)',
    definition: 'An abstraction layer in the kernel that provides a uniform interface for different filesystems (ext4, NTFS, NFS, etc.).',
    icon: '📁',
  },
  {
    term: 'errno',
    definition: 'A global variable set by system calls and library functions to indicate what went wrong when an error occurs.',
    icon: '❌',
  },
  {
    term: 'File Descriptor',
    definition: 'A non-negative integer that uniquely identifies an open file in a process. Standard values: 0 (stdin), 1 (stdout), 2 (stderr).',
    icon: '🔢',
  },
  {
    term: 'Context Switch',
    definition: 'The process of saving and restoring the state of a process or thread so that execution can be resumed from the same point later.',
    icon: '🔄',
  },
  {
    term: 'task_struct',
    definition: 'The kernel data structure that represents a process or thread in Linux. Contains PID, state, memory maps, file descriptors, and more.',
    icon: '🏗️',
  },
  {
    term: 'Copy-on-Write (COW)',
    definition: 'A memory optimization where multiple processes share the same physical memory pages until one writes to it, at which point a copy is made.',
    icon: '📄',
  },
];

export const GlossaryPanel = () => {
  return (
    <Card className="h-full">
      <div className="p-4 border-b bg-muted/50 flex items-center gap-2">
        <Book className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">OS Glossary</h3>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-4">
          {glossaryTerms.map((item) => (
            <div key={item.term} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                <h4 className="font-semibold text-primary">{item.term}</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

