export interface Edge {
  from: string;
  to: string;
}

export function detectDeadlock(allocations: Edge[], requests: Edge[]) {
  const graph = new Map<string, string[]>();
  const waitEdges = requests.map((request) => {
    const owner = allocations.find((allocation) => allocation.from === request.to);
    return owner ? { from: request.from, to: owner.to } : null;
  }).filter(Boolean) as Edge[];

  waitEdges.forEach((edge) => {
    graph.set(edge.from, [...(graph.get(edge.from) ?? []), edge.to]);
  });

  const visited = new Set<string>();
  const stack = new Set<string>();
  const cycle: string[] = [];

  const visit = (node: string): boolean => {
    visited.add(node);
    stack.add(node);
    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next) && visit(next)) {
        cycle.push(node);
        return true;
      }
      if (stack.has(next)) {
        cycle.push(next, node);
        return true;
      }
    }
    stack.delete(node);
    return false;
  };

  const hasCycle = Array.from(graph.keys()).some((node) => !visited.has(node) && visit(node));

  return {
    hasDeadlock: hasCycle,
    waitEdges,
    cycle: Array.from(new Set(cycle.reverse())),
  };
}
