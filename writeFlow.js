const writeFlow = {
  syscall: 'write',
  summary: 'Transfers bytes from a user buffer to a file descriptor.',
  steps: [
    {
      id: 1,
      title: 'Write Requested',
      mode: 'user',
      description: {
        beginner: 'The program calls write(fd, buf, count) to send data.',
        advanced: 'glibc write() collects arguments and prepares for the syscall transition.',
      },
      animation: 'fade',
    },
    {
      id: 2,
      title: 'Register Load',
      mode: 'user',
      description: {
        beginner: 'The CPU stores what to write and where.',
        advanced: 'RAX=1, RDI=fd, RSI=buf, RDX=count following the Linux syscall ABI.',
      },
      registers: {
        RAX: '1 (SYS_write)',
        RDI: 'fd',
        RSI: 'buf',
        RDX: 'count',
      },
      animation: 'pulse',
    },
    {
      id: 3,
      title: 'syscall Gate',
      mode: 'transition',
      description: {
        beginner: 'The CPU switches to kernel mode.',
        advanced: 'syscall instruction switches to ring 0 and jumps to the common entry stub.',
      },
      animation: 'slide',
    },
    {
      id: 4,
      title: 'Dispatch & Validation',
      mode: 'kernel',
      description: {
        beginner: 'The kernel checks if the descriptor is writable.',
        advanced: '__x64_sys_write() validates struct file, ensures FMODE_WRITE, and security modules approve.',
      },
      structures: [
        {
          name: 'file_struct',
          fields: {
            f_mode: 'FMODE_WRITE',
            f_pos: 'current offset',
          },
        },
      ],
      animation: 'fade',
    },
    {
      id: 5,
      title: 'copy_from_user',
      mode: 'kernel',
      description: {
        beginner: 'Data is copied from your program into kernel buffers.',
        advanced: 'copy_from_user() pulls bytes into kernel space, handling faults via do_page_fault().',
      },
      animation: 'slide',
    },
    {
      id: 6,
      title: 'Filesystem or Device Write',
      mode: 'kernel',
      description: {
        beginner: 'The kernel hands data to the filesystem or device driver.',
        advanced: 'vfs_write() invokes file_operations->write_iter(), which may trigger block I/O or tty buffering.',
      },
      animation: 'pulse',
    },
    {
      id: 7,
      title: 'Result Prepared',
      mode: 'kernel',
      description: {
        beginner: 'The kernel records how many bytes were written.',
        advanced: 'Return value set to bytes written or negative errno for partial/failed writes.',
      },
      animation: 'fade',
    },
    {
      id: 8,
      title: 'Return to User Land',
      mode: 'transition',
      description: {
        beginner: 'Control returns to your program.',
        advanced: 'Registers restored; RAX carries bytes written or -errno.',
      },
      registers: {
        RAX: 'bytes_written or -errno',
      },
      animation: 'slide',
    },
    {
      id: 9,
      title: 'Libc Cleanup',
      mode: 'user',
      description: {
        beginner: 'write() returns; your program may check the result.',
        advanced: 'glibc converts the raw result, sets errno if negative, and hands control back to user code.',
      },
      animation: 'fade',
    },
  ],
};

export default writeFlow;

