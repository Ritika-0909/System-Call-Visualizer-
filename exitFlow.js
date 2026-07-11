const exitFlow = {
  syscall: 'exit',
  summary: 'Terminates the current process and notifies the parent.',
  steps: [
    {
      id: 1,
      title: 'exit(status) Called',
      mode: 'user',
      description: {
        beginner: 'Program finishes and calls exit() or returns from main.',
        advanced: 'glibc eventually invokes _exit(), which issues SYS_exit_group.',
      },
      animation: 'fade',
    },
    {
      id: 2,
      title: 'Registers Ready',
      mode: 'user',
      description: {
        beginner: 'Exit status is placed into a register.',
        advanced: 'RAX=231 (SYS_exit_group), RDI=status before the syscall instruction.',
      },
      registers: {
        RAX: '231 (SYS_exit_group)',
        RDI: 'status',
      },
      animation: 'pulse',
    },
    {
      id: 3,
      title: 'Kernel Transition',
      mode: 'transition',
      description: {
        beginner: 'Control moves to the kernel for cleanup.',
        advanced: 'entry_SYSCALL_64() dispatches to __x64_sys_exit_group().',
      },
      animation: 'slide',
    },
    {
      id: 4,
      title: 'Notify Parent',
      mode: 'kernel',
      description: {
        beginner: 'Parent learns the process is exiting.',
        advanced: 'do_exit() records exit_code and sends SIGCHLD to the parent.',
      },
      animation: 'fade',
    },
    {
      id: 5,
      title: 'Resource Teardown',
      mode: 'kernel',
      description: {
        beginner: 'Open files and memory are released.',
        advanced: 'exit_files(), exit_mm(), exit_fs() drop file tables, unmap memory, and release working directories.',
      },
      structures: [
        {
          name: 'mm_struct',
          fields: {
            total_vm: 'virtual memory pages',
            pgd: 'page global directory pointer',
          },
        },
      ],
      animation: 'pulse',
    },
    {
      id: 6,
      title: 'Thread Group Shutdown',
      mode: 'kernel',
      description: {
        beginner: 'All threads in the process are terminated.',
        advanced: 'exit_group() signals all threads, ensures they exit, and marks the task EXIT_ZOMBIE.',
      },
      animation: 'fade',
    },
    {
      id: 7,
      title: 'Scheduler Handoff',
      mode: 'kernel',
      description: {
        beginner: 'The kernel removes the task from the run queue.',
        advanced: 'schedule() picks another runnable task; current process remains as a zombie until reaped.',
      },
      animation: 'slide',
    },
    {
      id: 8,
      title: 'Zombie Awaits Reaping',
      mode: 'transition',
      description: {
        beginner: 'Process is gone but exit status remains for the parent.',
        advanced: 'task_struct persists with exit_code until wait() collects it; afterwards release_task() frees it.',
      },
      animation: 'fade',
    },
    {
      id: 9,
      title: 'No Return to User',
      mode: 'user',
      description: {
        beginner: 'The original program never resumes.',
        advanced: 'Control only returns to the parent via wait(); the exiting task stops executing entirely.',
      },
      animation: 'fade',
    },
  ],
};

export default exitFlow;

