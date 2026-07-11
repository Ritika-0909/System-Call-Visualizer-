import openFlow from '@/visuals/openFlow';
import readFlow from '@/visuals/readFlow';
import writeFlow from '@/visuals/writeFlow';
import closeFlow from '@/visuals/closeFlow';
import forkFlow from '@/visuals/forkFlow';
import execveFlow from '@/visuals/execveFlow';
import waitFlow from '@/visuals/waitFlow';
import exitFlow from '@/visuals/exitFlow';

const registry = {
  open: openFlow,
  read: readFlow,
  write: writeFlow,
  close: closeFlow,
  fork: forkFlow,
  execve: execveFlow,
  wait: waitFlow,
  exit: exitFlow,
};

export const syscallVisualizations = registry;

export function getSyscallVisualization(syscallName) {
  return registry[syscallName] || null;
}

