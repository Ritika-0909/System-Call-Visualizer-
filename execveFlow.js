const execveFlow = {
  syscall: 'execve',
  summary: 'Replaces the current process image with a new program.',
  steps: [
    {
      id: 1,
      title: 'execve Invoked',
      mode: 'user',
      description: {
        beginner: 'The process requests to run another program.',
        advanced: 'glibc execve() wrapper collects pathname, argv, envp for the syscall.',
      },
      animation: 'fade',
    },
    {
      id: 2,
      title: 'Arguments Loaded',
      mode: 'user',
      description: {
        beginner: 'Pointers to the new program, arguments, and environment are prepared.',
        advanced: 'RAX=59, RDI=pathname, RSI=argv, RDX=envp according to the syscall ABI.',
      },
      registers: {
        RAX: '59 (SYS_execve)',
        RDI: 'pathname',
        RSI: 'argv pointer',
        RDX: 'envp pointer',
      },
      animation: 'pulse',
    },
    {
      id: 3,
      title: 'Kernel Entry',
      mode: 'transition',
      description: {
        beginner: 'The syscall instruction transfers control to the kernel.',
        advanced: 'entry_SYSCALL_64() dispatches to __x64_sys_execve().',
      },
      animation: 'slide',
    },
    {
      id: 4,
      title: 'Executable Checks',
      mode: 'kernel',
      description: {
        beginner: 'The kernel verifies the file exists and can be run.',
        advanced: 'do_execveat_common() resolves the path, enforces permissions, and reads ELF headers.',
      },
      structures: [
        {
          name: 'linux_binprm',
          fields: {
            filename: 'resolved path',
            cred: 'new credentials',
            file: 'struct file for executable',
          },
        },
      ],
      animation: 'fade',
    },
    {
      id: 5,
      title: 'Old Image Torn Down',
      mode: 'kernel',
      description: {
        beginner: 'Current code and data are discarded.',
        advanced: 'mm_release() and flush_old_exec() dismantle old mappings and clear signal handlers.',
      },
      animation: 'pulse',
    },
    {
      id: 6,
      title: 'New Memory Layout',
      mode: 'kernel',
      description: {
        beginner: 'The new program is mapped into memory.',
        advanced: 'load_elf_binary() maps text/data segments and allocates a fresh user stack.',
      },
      stack: ['argc', 'argv pointers', 'envp pointers', 'auxv entries'],
      animation: 'fade',
    },
    {
      id: 7,
      title: 'Arguments Copied',
      mode: 'kernel',
      description: {
        beginner: 'argv and envp move into the new user stack.',
        advanced: 'copy_strings_to_stack() transfers strings and aligns the stack for user entry.',
      },
      animation: 'slide',
    },
    {
      id: 8,
      title: 'Final Setup',
      mode: 'kernel',
      description: {
        beginner: 'Signal handlers reset and descriptors flagged close-on-exec are dropped.',
        advanced: 'exec_mmap() installs creds, resets signal dispositions, and closes O_CLOEXEC fds.',
      },
      animation: 'fade',
    },
    {
      id: 9,
      title: 'Jump to Entry Point',
      mode: 'transition',
      description: {
        beginner: 'The CPU prepares to start the new program.',
        advanced: 'start_thread() loads RIP with ELF entry and RSP with the new stack, returning via sysret.',
      },
      registers: {
        RIP: 'ELF entry point',
        RSP: 'new user stack',
      },
      animation: 'slide',
    },
    {
      id: 10,
      title: 'New Program Running',
      mode: 'user',
      description: {
        beginner: 'The new program begins executing main().',
        advanced: 'Control never returns to the old image; the process now owns a fresh address space.',
      },
      animation: 'fade',
    },
  ],
};

export default execveFlow;

