const closeFlow = {
  syscall: 'close',
  summary: 'Releases a file descriptor and its kernel resources.',
  steps: [
    {
      id: 1,
      title: 'close(fd) Called',
      mode: 'user',
      description: {
        beginner: 'Your program signals it is done with the descriptor.',
        advanced: 'glibc close() wrapper prepares to call SYS_close.',
      },
      animation: 'fade',
    },
    {
      id: 2,
      title: 'Registers Configured',
      mode: 'user',
      description: {
        beginner: 'The descriptor number is placed into a register.',
        advanced: 'RAX=3, RDI=fd for the close syscall.',
      },
      registers: {
        RAX: '3 (SYS_close)',
        RDI: 'fd',
      },
      animation: 'pulse',
    },
    {
      id: 3,
      title: 'Transition to Kernel',
      mode: 'transition',
      description: {
        beginner: 'syscall switches to kernel mode.',
        advanced: 'entry_SYSCALL_64() saves user context and enters __x64_sys_close().',
      },
      animation: 'slide',
    },
    {
      id: 4,
      title: 'Descriptor Lookup',
      mode: 'kernel',
      description: {
        beginner: 'The kernel finds the file object for that descriptor.',
        advanced: '__close_fd() locates the struct file in the files_struct table.',
      },
      structures: [
        {
          name: 'files_struct',
          fields: {
            fdtab: 'table of open descriptors',
            count: 'open count',
          },
        },
      ],
      animation: 'fade',
    },
    {
      id: 5,
      title: 'Reference Counts',
      mode: 'kernel',
      description: {
        beginner: 'Kernel decrements references and prepares to free resources.',
        advanced: 'fput() drops the file reference; release() callbacks run when counts hit zero.',
      },
      animation: 'pulse',
    },
    {
      id: 6,
      title: 'Resource Cleanup',
      mode: 'kernel',
      description: {
        beginner: 'Buffers, locks, and watchers are released.',
        advanced: 'Filesystem release hooks flush data, drop dentries, and update inode usage.',
      },
      animation: 'fade',
    },
    {
      id: 7,
      title: 'Return to User',
      mode: 'transition',
      description: {
        beginner: 'The kernel returns success or an error number.',
        advanced: 'RAX=0 on success or -errno on failure; sysret restores user space.',
      },
      registers: {
        RAX: '0 or -errno',
      },
      animation: 'slide',
    },
    {
      id: 8,
      title: 'Descriptor Reusable',
      mode: 'user',
      description: {
        beginner: 'The number can now be reused by future open() calls.',
        advanced: 'glibc updates libc bookkeeping and returns control to caller.',
      },
      animation: 'fade',
    },
  ],
};

export default closeFlow;

