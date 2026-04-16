export interface ProcessInput {
  id: string;
  arrival: number;
  burst: number;
}

export interface Segment {
  id: string;
  start: number;
  end: number;
}

function cloneProcesses(processes: ProcessInput[]) {
  return processes.map((process) => ({ ...process }));
}

function fcfs(processes: ProcessInput[]) {
  const queue = cloneProcesses(processes).sort((left, right) => left.arrival - right.arrival);
  let time = 0;
  const segments: Segment[] = [];
  queue.forEach((process) => {
    time = Math.max(time, process.arrival);
    segments.push({ id: process.id, start: time, end: time + process.burst });
    time += process.burst;
  });
  return segments;
}

function sjf(processes: ProcessInput[]) {
  const remaining = cloneProcesses(processes);
  const segments: Segment[] = [];
  let time = 0;
  while (remaining.length) {
    const candidates = remaining.filter((item) => item.arrival <= time);
    if (!candidates.length) {
      time = remaining[0].arrival;
      continue;
    }
    candidates.sort((left, right) => left.burst - right.burst);
    const chosen = candidates[0];
    segments.push({ id: chosen.id, start: time, end: time + chosen.burst });
    time += chosen.burst;
    remaining.splice(remaining.findIndex((item) => item.id === chosen.id), 1);
  }
  return segments;
}

function rr(processes: ProcessInput[], quantum: number) {
  const pending = cloneProcesses(processes).sort((left, right) => left.arrival - right.arrival);
  const ready: Array<ProcessInput & { remaining: number }> = [];
  const segments: Segment[] = [];
  let time = 0;

  while (pending.length || ready.length) {
    while (pending.length && pending[0].arrival <= time) {
      const next = pending.shift()!;
      ready.push({ ...next, remaining: next.burst });
    }
    if (!ready.length) {
      time = pending[0].arrival;
      continue;
    }
    const current = ready.shift()!;
    const slice = Math.min(current.remaining, quantum);
    segments.push({ id: current.id, start: time, end: time + slice });
    time += slice;
    current.remaining -= slice;
    while (pending.length && pending[0].arrival <= time) {
      const next = pending.shift()!;
      ready.push({ ...next, remaining: next.burst });
    }
    if (current.remaining > 0) {
      ready.push(current);
    }
  }

  return segments;
}

export function simulateScheduler(processes: ProcessInput[], algorithm: "FCFS" | "SJF" | "RR", quantum: number) {
  const segments = algorithm === "RR" ? rr(processes, quantum) : algorithm === "SJF" ? sjf(processes) : fcfs(processes);
  const completion = new Map<string, number>();
  segments.forEach((segment) => completion.set(segment.id, segment.end));

  const metrics = processes.map((process) => ({
    id: process.id,
    turnaround: (completion.get(process.id) ?? process.arrival) - process.arrival,
    waiting: (completion.get(process.id) ?? process.arrival) - process.arrival - process.burst,
  }));

  return { segments, metrics };
}
