const waitFlow = {
  syscall: 'wait',
  summary: 'Suspends the parent until a child changes state or exits.',
  steps: [
    {
      id: 1,
      title: 'wait() Called',
      mode: 'user',
      description: {
        beginner: 'Parent process calls wait or waitpid to monitor children.',
        advanced: 'glibc wait() maps to SYS_wait4/SYS_waitid with appropriate flags.',
      },
      animation: 'fade',
    },
    {
      id: 2,
      title: 'Syscall Arguments',
      mode: 'user',
      description: {
        beginner: 'The child PID to wait for and a pointer for status are prepared.',
        advanced: 'RAX=61, RDI=pid/-1, RSI=status pointer, RDX=options, R10=rusage pointer.',
      },
      registers: {
        RAX: '61 (SYS_wait4)',
        RDI: 'pid/-1',
        RSI: 'status*',
        RDX: 'options',
      },
      animation: 'pulse',
    },
    {
      id: 3,
      title: 'Kernel Entry',
      mode: 'transition',
      description: {
        beginner: 'The CPU crosses into kernel mode to manage child state.',
        advanced: 'entry_SYSCALL_64() dispatches to __x64_sys_wait4().',
      },
      animation: 'slide',
    },
    {
      id: 4,
      title: 'Child Search',
      mode: 'kernel',
      description: {
        beginner: 'Kernel checks the parent\'s child list for exited or stopped processes.',
        advanced: 'do_wait() iterates current->children and current->ptraced lists to find matching tasks.',
      },
      structures: [
        {
          name: 'task_struct',
          fields: {
            children: 'list of children',
            exit_state: 'EXIT_ZOMBIE / DEAD',
          },
        },
      ],
      animation: 'fade',
    },
    {
      id: 5,
      title: 'Sleep if Needed',
      mode: 'kernel',
      description: {
        beginner: 'If no child is ready, the parent sleeps.',
        advanced: 'schedule() parks the task in TASK_INTERRUPTIBLE on the wait queue until a child exits or signal arrives.',
      },
      animation: 'pulse',
    },
    {
      id: 6,
      title: 'Collect Exit Status',
      mode: 'kernel',
      description: {
        beginner: 'Zombie child information is gathered.',
        advanced: 'wait_task_zombie() copies exit_code and rusage to user memory and releases the task_struct.',
      },
      animation: 'fade',
    },
    {
      id: 7,
      title: 'Copy Status to User',
      mode: 'kernel',
      description: {
        beginner: 'Exit status is written to the provided pointer.',
        advanced: 'copy_to_user(status, &status_val, sizeof(int)) shares the child\'s exit code.',
      },
      animation: 'slide',
    },
    {
      id: 8,
      title: 'Return to Parent',
      mode: 'transition',
      description: {
        beginner: 'Parent wakes up with the child PID.',
        advanced: 'RAX contains child PID or -1; errno reflects EINTR or ECHILD edge cases.',
      },
      registers: {
        RAX: 'child PID or -errno',
      },
      animation: 'slide',
    },
    {
      id: 9,
      title: 'Parent Continues',
      mode: 'user',
      description: {
        beginner: 'wait() returns, letting the parent handle the child\'s outcome.',
        advanced: 'glibc wrapper forwards PID/errno and resumes normal scheduling for the parent.',
      },
      animation: 'fade',
    },
  ],
};

export default waitFlow;

