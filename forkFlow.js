const forkFlow = {
  syscall: 'fork',
  summary: 'Creates a child process sharing much of the parent state.',
  steps: [
    {
      id: 1,
      title: 'fork() Called',
      mode: 'user',
      description: {
        beginner: 'The program asks the OS to create a new process.',
        advanced: 'glibc fork() wrapper maps to clone() with SIGCHLD semantics.',
      },
      animation: 'fade',
    },
    {
      id: 2,
      title: 'Enter Kernel',
      mode: 'transition',
      description: {
        beginner: 'The syscall instruction transfers control to the kernel.',
        advanced: 'Registers carry clone flags; entry code dispatches to __x64_sys_clone().',
      },
      registers: {
        RAX: '57 (SYS_clone)',
        RDI: 'flags (SIGCHLD)',
      },
      animation: 'slide',
    },
    {
      id: 3,
      title: 'copy_process',
      mode: 'kernel',
      description: {
        beginner: 'The kernel builds a new task_struct for the child.',
        advanced: 'copy_process() duplicates registers, files, signal handlers, and namespaces.',
      },
      structures: [
        {
          name: 'task_struct',
          fields: {
            pid: 'assigned child PID',
            parent: 'pointer to parent task',
            flags: 'TASK_RUNNING',
          },
        },
      ],
      animation: 'fade',
    },
    {
      id: 4,
      title: 'Copy-on-Write Setup',
      mode: 'kernel',
      description: {
        beginner: 'Parent and child initially share memory pages safely.',
        advanced: 'Page tables are shared read-only; writes trigger copy-on-write faults.',
      },
      animation: 'pulse',
    },
    {
      id: 5,
      title: 'Scheduler Enqueue',
      mode: 'kernel',
      description: {
        beginner: 'The child process is scheduled to run.',
        advanced: 'wake_up_new_task() adds child to runqueue, ready for the scheduler.',
      },
      animation: 'fade',
    },
    {
      id: 6,
      title: 'Dual Return Values',
      mode: 'transition',
      description: {
        beginner: 'Parent gets the child PID, child sees 0.',
        advanced: 'Parent return path loads RAX=childPID; child path begins at ret_from_fork with RAX=0.',
      },
      registers: {
        RAX: 'child PID (parent) / 0 (child)',
      },
      animation: 'slide',
    },
    {
      id: 7,
      title: 'Both Processes Resume',
      mode: 'user',
      description: {
        beginner: 'Parent and child continue executing independently.',
        advanced: 'Control returns to user mode twice; each process decides its next steps.',
      },
      animation: 'fade',
    },
  ],
};

export default forkFlow;

