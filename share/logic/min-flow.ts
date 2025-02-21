import { asserting } from "../lib.ts";

class MinCostFlow {
  n: number;
  edges: { from: number; to: number; capacity: number; cost: number; flow: number }[];
  graph: number[][];
  constructor(n: number) {
    this.n = n;
    this.edges = [];
    this.graph = Array.from({ length: n }, () => []);
  }

  addEdge(from: number, to: number, capacity: number, cost: number) {
    this.edges.push({ from, to, capacity, cost, flow: 0 });
    this.edges.push({ from: to, to: from, capacity: 0, cost: -cost, flow: 0 });

    this.graph[from].push(this.edges.length - 2);
    this.graph[to].push(this.edges.length - 1);
  }

  minCostMaxFlow(source: number, sink: number) {
    const INF = Number.POSITIVE_INFINITY;
    let totalFlow = 0;
    let totalCost = 0;

    while (true) {
      const dist = new Array(this.n).fill(INF);
      const inQueue = new Array(this.n).fill(false);
      const prev = new Array(this.n).fill(-1);
      const prevEdge = new Array(this.n).fill(-1);
      const queue = [source];

      dist[source] = 0;
      inQueue[source] = true;

      while (queue.length > 0) {
        const u = asserting(queue.shift());
        inQueue[u] = false;

        for (const i of this.graph[u]) {
          const e = this.edges[i];
          if (e.flow < e.capacity && dist[e.to] > dist[u] + e.cost) {
            dist[e.to] = dist[u] + e.cost;
            prev[e.to] = u;
            prevEdge[e.to] = i;
            if (!inQueue[e.to]) {
              queue.push(e.to);
              inQueue[e.to] = true;
            }
          }
        }
      }

      if (dist[sink] === INF) {
        break;
      }

      let flow = INF;
      for (let v = sink; v !== source; v = prev[v]) {
        flow = Math.min(flow, this.edges[prevEdge[v]].capacity - this.edges[prevEdge[v]].flow);
      }

      for (let v = sink; v !== source; v = prev[v]) {
        this.edges[prevEdge[v]].flow += flow;
        this.edges[prevEdge[v] ^ 1].flow -= flow;
      }

      totalFlow += flow;
      totalCost += flow * dist[sink];
    }

    return { flow: totalFlow, cost: totalCost };
  }
}

export function findAllOptimalAssignments(
  participants: number[][],
  roles: number[],
  minMaxConstraints: { min: number; max: number }[],
) {
  const n = participants.length;
  const m = roles.length;
  const source = n + m;
  const sink = source + 1;
  const solver = new MinCostFlow(sink + 1);
  const INF = 1e9;

  for (let i = 0; i < n; i++) {
    solver.addEdge(source, i, 1, 0); // 各 participant から 1 の供給
  }

  for (let j = 0; j < m; j++) {
    solver.addEdge(n + j, sink, minMaxConstraints[j].max, 0);
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      solver.addEdge(i, n + j, 1, -participants[i][j]); // スコアを負にする
    }
  }

  const solutions: { participant: number; role: number }[][] = [];
  let baseCost: number;

  while (true) {
    const { flow, cost } = solver.minCostMaxFlow(source, sink);
    if (flow < n) {
      break;
    }

    baseCost ??= cost;
    if (cost > baseCost) {
      break;
    }

    const assignment: { participant: number; role: number }[] = [];
    for (let i = 0; i < n; i++) {
      for (const e of solver.graph[i]) {
        const edge = solver.edges[e];
        if (edge.flow === 1) {
          assignment.push({ participant: i, role: edge.to - n });
        }
      }
    }

    solutions.push(assignment);

    // 直前の解を禁止する制約を追加
    const prohibitNode = sink + solutions.length;
    solver.n = prohibitNode + 1;
    solver.graph.push([]);

    for (const { participant, role } of assignment) {
      const e = solver.edges.findIndex((e) => e.from === participant && e.to === n + role);
      if (e !== -1) {
        solver.edges[e].capacity = 0; // この組み合わせを禁止
      }
    }

    solver.addEdge(prohibitNode, sink, INF, 0);
  }

  return solutions;
}
