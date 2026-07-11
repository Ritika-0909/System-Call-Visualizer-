const openFlow = {
  syscall: 'open',
  summary: 'Opens a file path and returns a file descriptor.',
  steps: [
    {
      id: 1,
      title: 'User Call',
      mode: 'user',
      description: {
        beginner: 'The program calls open(path, flags, mode) to access a file.',
        advanced: 'glibc open() wrapper prepares to issue SYS_openat (or SYS_open).',
      },
      animation: 'fade',
    },
    {
      id: 2,
      title: 'Registers Prepared',
      mode: 'user',
      description: {
        beginner: 'Filename and options are placed into registers.',
        advanced: 'RAX=2, RDI=pathname, RSI=flags, RDX=mode, ready for the syscall.',
      },
      registers: {
        RAX: '2 (SYS_open)',
        RDI: 'pathname',
        RSI: 'flags',
        RDX: 'mode',
      },
      animation: 'pulse',
    },
    {
      id: 3,
      title: 'Privilege Switch',
      mode: 'transition',
      description: {
        beginner: 'The CPU switches to kernel mode.',
        advanced: 'syscall transfers control to entry_SYSCALL_64(), switching to the kernel stack.',
      },
      animation: 'slide',
    },
    {
      id: 4,
      title: 'Path Resolution',
      mode: 'kernel',
      description: {
        beginner: 'The kernel walks the filesystem to locate the file.',
        advanced: 'link_path_walk() resolves the pathname within the Virtual Filesystem layer.',
      },
      structures: [
        {
          name: 'nameidata',
          fields: {
            dentry: 'directory entry',
            inode: 'resolved inode',
          },
        },
      ],
      animation: 'fade',
    },
    {
      id: 5,
      title: 'Permission Checks',
      mode: 'kernel',
      description: {
        beginner: 'The kernel ensures you are allowed to open the file.',
        advanced: 'Security modules (LSM) and inode permission checks (may_open) run before granting access.',
      },
      animation: 'fade',
    },
    {
      id: 6,
      title: 'File Descriptor Allocation',
      mode: 'kernel',
      description: {
        beginner: 'A new file descriptor is assigned to your process.',
        advanced: 'alloc_fd() selects the lowest free entry in current->files; get_file_rcu() increments references.',
      },
      structures: [
        {
          name: 'file_struct',
          fields: {
            f_mode: 'access mode',
            f_pos: 'file offset',
            f_op: 'operations',
          },
        },
      ],
      animation: 'pulse',
    },
    {
      id: 7,
      title: 'Return to User',
      mode: 'transition',
      description: {
        beginner: 'The kernel returns the descriptor number.',
        advanced: 'RAX is set to fd or -errno; sysret restores ring 3 context.',
      },
      registers: {
        RAX: 'fd or -errno',
      },
      animation: 'slide',
    },
    {
      id: 8,
      title: 'User Mode Resume',
      mode: 'user',
      description: {
        beginner: 'Your code continues, ready to read or write the file descriptor.',
        advanced: 'glibc wrapper returns fd; errno is updated on failure.',
      },
      animation: 'fade',
    },
  ],
};

export default openFlow;

