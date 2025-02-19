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
    const INF = 1e9;
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

function findAllOptimalAssignments(
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

// **例**
const participants = [
  [5, 4, 3, 2, 1], // P1 の希望 (R1, R2, R3, R4, R5)
  [2, 5, 3, 1, 4], // P2 の希望
  [3, 3, 5, 4, 2], // P3 の希望
  [4, 1, 2, 5, 3], // P4 の希望
  [1, 2, 4, 3, 5], // P5 の希望
  [5, 3, 2, 4, 1], // P6 の希望
  [4, 5, 1, 2, 3], // P7 の希望
  [3, 2, 4, 1, 5], // P8 の希望
  [2, 4, 3, 5, 1], // P9 の希望
  [1, 5, 4, 3, 2], // P10 の希望
];

const roles = [0, 1, 2, 3, 4]; // 役割 ID
const minMaxConstraints = [
  { min: 1, max: 3 }, // R1 の min/max
  { min: 2, max: 4 }, // R2 の min/max
  { min: 1, max: 3 }, // R3 の min/max
  { min: 2, max: 3 }, // R4 の min/max
  { min: 1, max: 2 }, // R5 の min/max
];

console.log(findAllOptimalAssignments(participants, roles, minMaxConstraints));
