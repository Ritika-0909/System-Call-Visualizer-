const readFlow = {
  syscall: 'read',
  summary: 'Reads data from a file descriptor into a user buffer.',
  steps: [
    {
      id: 1,
      title: 'Libc Wrapper Invoked',
      mode: 'user',
      description: {
        beginner: 'Your program calls read(fd, buf, count) to request data.',
        advanced: 'User code enters the glibc read() wrapper, preparing for a direct syscall.',
      },
      animation: 'fade',
    },
    {
      id: 2,
      title: 'Register Setup',
      mode: 'user',
      description: {
        beginner: 'The CPU puts the file descriptor, buffer address, and byte count into registers.',
        advanced: 'RAX=0, RDI=fd, RSI=buf, RDX=count following the x86_64 Linux syscall ABI.',
      },
      registers: {
        RAX: '0 (SYS_read)',
        RDI: 'fd',
        RSI: 'buf',
        RDX: 'count',
      },
      animation: 'pulse',
    },
    {
      id: 3,
      title: 'syscall Instruction',
      mode: 'transition',
      description: {
        beginner: 'A special instruction switches the CPU into kernel mode.',
        advanced: 'The syscall instruction raises privilege to ring 0 and jumps to entry_SYSCALL_64().',
      },
      animation: 'slide',
    },
    {
      id: 4,
      title: 'Kernel Entry',
      mode: 'kernel',
      description: {
        beginner: 'The kernel takes control and saves the user context.',
        advanced: 'The kernel switches stacks, saves registers into pt_regs, and begins handling SYS_read.',
      },
      stack: ['Saved RIP', 'Saved RFLAGS', 'Saved RSP', 'Saved SS'],
      animation: 'fade',
    },
    {
      id: 5,
      title: 'Syscall Dispatch',
      mode: 'kernel',
      description: {
        beginner: 'The kernel looks up which function handles read().',
        advanced: 'RAX indexes the sys_call_table, selecting __x64_sys_read().',
      },
      animation: 'pulse',
    },
    {
      id: 6,
      title: 'Validation & Permissions',
      mode: 'kernel',
      description: {
        beginner: 'The kernel checks that the file can be read and the buffer is valid.',
        advanced: 'vfs_read() validates the struct file, confirms FMODE_READ, and calls access_ok() on the user buffer.',
      },
      structures: [
        {
          name: 'file_struct',
          fields: {
            f_mode: 'FMODE_READ',
            f_pos: 'current offset',
            f_op: 'file operations table',
          },
        },
      ],
      animation: 'fade',
    },
    {
      id: 7,
      title: 'Filesystem Read',
      mode: 'kernel',
      description: {
        beginner: 'The filesystem or device driver fetches the data.',
        advanced: 'The VFS calls file_operations->read_iter() or equivalent for the backing filesystem/device.',
      },
      animation: 'slide',
    },
    {
      id: 8,
      title: 'copy_to_user',
      mode: 'kernel',
      description: {
        beginner: 'Data is copied from kernel memory into your program buffer.',
        advanced: 'The helper copy_to_user() moves bytes into user space, resolving page faults if required.',
      },
      animation: 'slide',
    },
    {
      id: 9,
      title: 'Return to User Mode',
      mode: 'transition',
      description: {
        beginner: 'Control switches back to your program.',
        advanced: 'RAX is loaded with bytes read (or -errno). sysret restores the saved context.',
      },
      registers: {
        RAX: 'bytes_read or -errno',
      },
      animation: 'slide',
    },
    {
      id: 10,
      title: 'Libc Returns',
      mode: 'user',
      description: {
        beginner: 'Your program resumes with the data ready in its buffer.',
        advanced: 'glibc converts the raw return value to ssize_t, setting errno on errors.',
      },
      animation: 'fade',
    },
  ],
};

export default readFlow;

