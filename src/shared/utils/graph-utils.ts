export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cyclePath?: string[];
  depthExceeded?: boolean;
  maxDepthReached?: number;
}

export function buildAdjacencyList(edges: GraphEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push(e.target);
  }
  return adj;
}

export function buildWeightedAdjacencyList(
  edges: GraphEdge[]
): Map<string, Array<{ target: string; weight: number }>> {
  const adj = new Map<string, Array<{ target: string; weight: number }>>();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, []);
    adj.get(e.source)!.push({ target: e.target, weight: e.weight });
  }
  return adj;
}

export function detectCycle(adjList: Map<string, string[]>, maxDepth: number = 100): CycleDetectionResult {
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];
  let depthExceeded = false;
  let maxDepthReached = 0;

  const allNodes = new Set<string>();
  for (const [s, targets] of adjList.entries()) {
    allNodes.add(s);
    for (const t of targets) allNodes.add(t);
  }

  function dfs(node: string, depth: number): string[] | null {
    if (depth > maxDepthReached) maxDepthReached = depth;
    if (depth > maxDepth) {
      depthExceeded = true;
      return null;
    }
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = adjList.get(node) || [];
    for (const nb of neighbors) {
      if (!visited.has(nb)) {
        const cyc = dfs(nb, depth + 1);
        if (cyc) return cyc;
      } else if (recStack.has(nb)) {
        const start = path.indexOf(nb);
        const cycPath = [...path.slice(start), nb];
        return cycPath;
      }
    }

    recStack.delete(node);
    path.pop();
    return null;
  }

  for (const n of allNodes) {
    if (!visited.has(n)) {
      const cyc = dfs(n, 0);
      if (cyc) {
        return { hasCycle: true, cyclePath: cyc, depthExceeded: false, maxDepthReached };
      }
    }
  }

  return { hasCycle: false, depthExceeded, maxDepthReached };
}

export function wouldCreateCycle(
  adjList: Map<string, string[]>,
  newSource: string,
  newTarget: string,
  maxDepth: number = 100
): boolean {
  const temp = new Map<string, string[]>();
  for (const [k, v] of adjList.entries()) temp.set(k, [...v]);
  if (!temp.has(newSource)) temp.set(newSource, []);
  temp.get(newSource)!.push(newTarget);
  const res = detectCycle(temp, maxDepth);
  return res.hasCycle;
}

export function findAllPaths(
  adjList: Map<string, string[]>,
  source: string,
  target: string,
  maxPaths: number = 10,
  maxDepth: number = 100
): string[][] {
  const paths: string[][] = [];
  const current: string[] = [];
  const visited = new Set<string>();

  function dfs(node: string, depth: number) {
    if (paths.length >= maxPaths || depth > maxDepth) return;
    current.push(node);
    visited.add(node);
    if (node === target) {
      paths.push([...current]);
    } else {
      const neighbors = adjList.get(node) || [];
      for (const nb of neighbors) {
        if (!visited.has(nb)) dfs(nb, depth + 1);
      }
    }
    current.pop();
    visited.delete(node);
  }

  dfs(source, 0);
  return paths;
}

export function getDownstreamNodes(
  adjList: Map<string, string[]>,
  startNode: string,
  maxDepth: number = 100
): Set<string> {
  const out = new Set<string>();
  const visited = new Set<string>();
  function dfs(node: string, depth: number) {
    if (depth > maxDepth || visited.has(node)) return;
    visited.add(node);
    out.add(node);
    for (const nb of adjList.get(node) || []) dfs(nb, depth + 1);
  }
  dfs(startNode, 0);
  out.delete(startNode);
  return out;
}

export function getUpstreamNodes(
  adjList: Map<string, string[]>,
  targetNode: string,
  maxDepth: number = 100
): Set<string> {
  const rev = new Map<string, string[]>();
  for (const [s, targets] of adjList.entries()) {
    for (const t of targets) {
      if (!rev.has(t)) rev.set(t, []);
      rev.get(t)!.push(s);
    }
  }
  return getDownstreamNodes(rev, targetNode, maxDepth);
}

export function topologicalSort(adjList: Map<string, string[]>): string[] | null {
  const inDeg = new Map<string, number>();
  const nodes = new Set<string>();
  for (const [s, targets] of adjList.entries()) {
    nodes.add(s);
    if (!inDeg.has(s)) inDeg.set(s, 0);
    for (const t of targets) {
      nodes.add(t);
      inDeg.set(t, (inDeg.get(t) || 0) + 1);
    }
  }
  const queue: string[] = [];
  for (const n of nodes) {
    if (!inDeg.has(n) || inDeg.get(n) === 0) queue.push(n);
  }
  const sorted: string[] = [];
  while (queue.length) {
    const n = queue.shift()!;
    sorted.push(n);
    for (const nb of adjList.get(n) || []) {
      const nd = (inDeg.get(nb) || 0) - 1;
      inDeg.set(nb, nd);
      if (nd === 0) queue.push(nb);
    }
  }
  if (sorted.length !== nodes.size) return null;
  return sorted;
}

export function hasPath(
  adjList: Map<string, string[]>,
  source: string,
  target: string,
  maxDepth: number = 100
): boolean {
  const visited = new Set<string>();
  function dfs(node: string, depth: number): boolean {
    if (depth > maxDepth || visited.has(node)) return false;
    if (node === target) return true;
    visited.add(node);
    for (const nb of adjList.get(node) || []) {
      if (dfs(nb, depth + 1)) return true;
    }
    return false;
  }
  return dfs(source, 0);
}

export function getStronglyConnectedComponents(adjList: Map<string, string[]>): Set<string>[] {
  const nodes = new Set<string>();
  for (const [s, targets] of adjList.entries()) {
    nodes.add(s);
    targets.forEach((t) => nodes.add(t));
  }
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const comps: Set<string>[] = [];
  let cur = 0;

  function strongConnect(v: string) {
    index.set(v, cur);
    low.set(v, cur);
    cur++;
    stack.push(v);
    onStack.add(v);
    for (const w of adjList.get(v) || []) {
      if (!index.has(w)) {
        strongConnect(w);
        low.set(v, Math.min(low.get(v)!, low.get(w)!));
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v)!, index.get(w)!));
      }
    }
    if (low.get(v) === index.get(v)) {
      const comp = new Set<string>();
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        comp.add(w);
      } while (w !== v);
      comps.push(comp);
    }
  }

  for (const n of nodes) {
    if (!index.has(n)) strongConnect(n);
  }
  return comps;
}

export function countNodes(adjList: Map<string, string[]>): number {
  const nodes = new Set<string>();
  for (const [s, targets] of adjList.entries()) {
    nodes.add(s);
    targets.forEach((t) => nodes.add(t));
  }
  return nodes.size;
}

export function countEdges(adjList: Map<string, string[]>): number {
  let c = 0;
  for (const targets of adjList.values()) c += targets.length;
  return c;
}

export function findSourceNodes(adjList: Map<string, string[]>): Set<string> {
  const all = new Set<string>();
  const incoming = new Set<string>();
  for (const [s, targets] of adjList.entries()) {
    all.add(s);
    targets.forEach((t) => {
      all.add(t);
      incoming.add(t);
    });
  }
  const res = new Set<string>();
  for (const n of all) if (!incoming.has(n)) res.add(n);
  return res;
}

export function findSinkNodes(adjList: Map<string, string[]>): Set<string> {
  const all = new Set<string>();
  const outgoing = new Set<string>();
  for (const [s, targets] of adjList.entries()) {
    all.add(s);
    outgoing.add(s);
    targets.forEach((t) => all.add(t));
  }
  const res = new Set<string>();
  for (const n of all) if (!outgoing.has(n)) res.add(n);
  return res;
}