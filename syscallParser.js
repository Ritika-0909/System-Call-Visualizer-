// Common Linux syscalls with their patterns
const SYSCALL_PATTERNS = [
  { name: 'open', pattern: /\bopen\s*\(/, category: 'file' },
  { name: 'read', pattern: /\bread\s*\(/, category: 'file' },
  { name: 'write', pattern: /\bwrite\s*\(/, category: 'file' },
  { name: 'close', pattern: /\bclose\s*\(/, category: 'file' },
  { name: 'fork', pattern: /\bfork\s*\(/, category: 'process' },
  { name: 'exec', pattern: /\bexec[vl][ep]?\s*\(/, category: 'process' },
  { name: 'wait', pattern: /\bwait(pid|id)?\s*\(/, category: 'process' },
  { name: 'exit', pattern: /\bexit\s*\(/, category: 'process' },
  { name: 'malloc', pattern: /\bmalloc\s*\(/, category: 'memory' },
  { name: 'free', pattern: /\bfree\s*\(/, category: 'memory' },
  { name: 'mmap', pattern: /\bmmap\s*\(/, category: 'memory' },
  { name: 'munmap', pattern: /\bmunmap\s*\(/, category: 'memory' },
  { name: 'brk', pattern: /\bbrk\s*\(/, category: 'memory' },
  { name: 'socket', pattern: /\bsocket\s*\(/, category: 'network' },
  { name: 'bind', pattern: /\bbind\s*\(/, category: 'network' },
  { name: 'listen', pattern: /\blisten\s*\(/, category: 'network' },
  { name: 'accept', pattern: /\baccept\s*\(/, category: 'network' },
  { name: 'connect', pattern: /\bconnect\s*\(/, category: 'network' },
  { name: 'send', pattern: /\bsend\s*\(/, category: 'network' },
  { name: 'recv', pattern: /\brecv\s*\(/, category: 'network' },
  { name: 'ioctl', pattern: /\bioctl\s*\(/, category: 'other' },
  { name: 'fcntl', pattern: /\bfcntl\s*\(/, category: 'other' },
  { name: 'dup', pattern: /\bdup[2]?\s*\(/, category: 'file' },
  { name: 'pipe', pattern: /\bpipe\s*\(/, category: 'file' },
  { name: 'stat', pattern: /\b(stat|fstat|lstat)\s*\(/, category: 'file' },
  { name: 'chmod', pattern: /\bchmod\s*\(/, category: 'file' },
  { name: 'chown', pattern: /\bchown\s*\(/, category: 'file' },
  { name: 'kill', pattern: /\bkill\s*\(/, category: 'process' },
  { name: 'signal', pattern: /\bsignal\s*\(/, category: 'process' },
  { name: 'getpid', pattern: /\bgetpid\s*\(/, category: 'process' },
  { name: 'getuid', pattern: /\bgetuid\s*\(/, category: 'process' },
];

const CATEGORY_MAP = {
  open: 'file',
  read: 'file',
  write: 'file',
  close: 'file',
  fork: 'process',
  execve: 'process',
  exec: 'process',
  wait: 'process',
  exit: 'process',
  pipe: 'file',
  dup: 'file',
  stat: 'file',
  chmod: 'file',
  chown: 'file',
  kill: 'process',
  signal: 'process',
  malloc: 'memory',
  free: 'memory',
  mmap: 'memory',
  munmap: 'memory',
  brk: 'memory',
  socket: 'network',
  bind: 'network',
  listen: 'network',
  accept: 'network',
  connect: 'network',
  send: 'network',
  recv: 'network',
  ioctl: 'other',
  fcntl: 'other',
};

export function parseCCode(code) {
  const lines = code.split('\n');
  const syscallMap = new Map();

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
      return;
    }

    SYSCALL_PATTERNS.forEach(({ name, pattern, category }) => {
      if (pattern.test(line)) {
        const existing = syscallMap.get(name);
        if (existing) {
          existing.count++;
          existing.lines.push(index + 1);
        } else {
          syscallMap.set(name, {
            name,
            count: 1,
            lines: [index + 1],
            category: category,
          });
        }
      }
    });
  });

  const syscalls = Array.from(syscallMap.values()).sort((a, b) => b.count - a.count);

  return {
    code,
    syscalls,
    totalLines: lines.length,
  };
}

export function getCategoryColor(category) {
  const colors = {
    file: 'userMode',
    process: 'kernelMode',
    memory: 'dataTransfer',
    network: 'blockedState',
    other: 'muted',
  };
  return colors[category] || colors.other;
}

export function getCategoryIcon(category) {
  const icons = {
    file: '📁',
    process: '⚙️',
    memory: '🧠',
    network: '🌐',
    other: '🔧',
  };
  return icons[category] || icons.other;
}

export function getSyscallCategory(name) {
  return CATEGORY_MAP[name] || 'other';
}

