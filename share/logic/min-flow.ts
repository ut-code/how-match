// import { asserting } from "../lib.ts";

// class MinCostFlow {
//   n: number;
//   edges: { from: number; to: number; capacity: number; cost: number; flow: number }[];
//   graph: number[][];
//   constructor(n: number) {
//     this.n = n;
//     this.edges = [];
//     this.graph = Array.from({ length: n }, () => []);
//   }

//   addEdge(from: number, to: number, capacity: number, cost: number) {
//     this.edges.push({ from, to, capacity, cost, flow: 0 });
//     this.edges.push({ from: to, to: from, capacity: 0, cost: -cost, flow: 0 });

//     this.graph[from].push(this.edges.length - 2);
//     this.graph[to].push(this.edges.length - 1);
//   }

//   minCostMaxFlow(source: number, sink: number) {
//     const INF = Number.POSITIVE_INFINITY;
//     let totalFlow = 0;
//     let totalCost = 0;

//     while (true) {
//       const dist = new Array(this.n).fill(INF);
//       const inQueue = new Array(this.n).fill(false);
//       const prev = new Array(this.n).fill(-1);
//       const prevEdge = new Array(this.n).fill(-1);
//       const queue = [source];

//       dist[source] = 0;
//       inQueue[source] = true;

//       while (queue.length > 0) {
//         const u = asserting(queue.shift());
//         inQueue[u] = false;

//         for (const i of this.graph[u]) {
//           const e = this.edges[i];
//           if (e.flow < e.capacity && dist[e.to] > dist[u] + e.cost) {
//             dist[e.to] = dist[u] + e.cost;
//             prev[e.to] = u;
//             prevEdge[e.to] = i;
//             if (!inQueue[e.to]) {
//               queue.push(e.to);
//               inQueue[e.to] = true;
//             }
//           }
//         }
//       }

//       if (dist[sink] === INF) {
//         break;
//       }

//       let flow = INF;
//       for (let v = sink; v !== source; v = prev[v]) {
//         flow = Math.min(flow, this.edges[prevEdge[v]].capacity - this.edges[prevEdge[v]].flow);
//       }

//       for (let v = sink; v !== source; v = prev[v]) {
//         this.edges[prevEdge[v]].flow += flow;
//         this.edges[prevEdge[v] ^ 1].flow -= flow;
//       }

//       totalFlow += flow;
//       totalCost += flow * dist[sink];
//     }

//     return { flow: totalFlow, cost: totalCost };
//   }
// }

// export function findAllOptimalAssignments(
//   participants: number[][],
//   roles: number[],
//   minMaxConstraints: { min: number; max: number }[],
// ) {
//   const n = participants.length;
//   const m = roles.length;
//   const source = n + m;
//   const sink = source + 1;
//   const solver = new MinCostFlow(sink + 1);
//   const INF = 1e9;

//   for (let i = 0; i < n; i++) {
//     solver.addEdge(source, i, 1, 0); // 各 participant から 1 の供給
//   }

//   for (let j = 0; j < m; j++) {
//     solver.addEdge(n + j, sink, minMaxConstraints[j].max, 0);
//   }

//   for (let i = 0; i < n; i++) {
//     for (let j = 0; j < m; j++) {
//       solver.addEdge(i, n + j, 1, -participants[i][j]); // スコアを負にする
//     }
//   }

//   const solutions: { participant: number; role: number }[][] = [];
//   let baseCost: number;

//   while (true) {
//     const { flow, cost } = solver.minCostMaxFlow(source, sink);
//     if (flow < n) {
//       break;
//     }

//     baseCost ??= cost;
//     if (cost > baseCost) {
//       break;
//     }

//     const assignment: { participant: number; role: number }[] = [];
//     for (let i = 0; i < n; i++) {
//       for (const e of solver.graph[i]) {
//         const edge = solver.edges[e];
//         if (edge.flow === 1) {
//           assignment.push({ participant: i, role: edge.to - n });
//         }
//       }
//     }

//     solutions.push(assignment);

//     // 直前の解を禁止する制約を追加
//     const prohibitNode = sink + solutions.length;
//     solver.n = prohibitNode + 1;
//     solver.graph.push([]);

//     for (const { participant, role } of assignment) {
//       const e = solver.edges.findIndex((e) => e.from === participant && e.to === n + role);
//       if (e !== -1) {
//         solver.edges[e].capacity = 0; // この組み合わせを禁止
//       }
//     }

//     solver.addEdge(prohibitNode, sink, INF, 0);
//   }

//   return solutions;
// }

/**
 * assignRoles
 *  - participants: 各参加者が各 role に対して与えたスコアの 2 次元配列
 *      （participants[i][j] が participant i の role j に対するスコア）
 *  - roles: role の識別子配列（内部的には 0～M-1 のインデックスを用いる）
 *  - minMaxConstraints: 各 role に対する { min, max } 制約
 *
 * 各 participant を 1 つの role に割り当て、各 role の割当人数が min, max を満たす中で
 * 総スコアが最大になる割当を返します。
 *
 * なお、sum(min) <= participants.length であることを前提とし、
 * もし participants.length > sum(max) であれば、余剰参加者は dummy role（score=0）に割り当てます。
 */
export function assignRoles(
  participants: number[][],
  roles: number[],
  minMaxConstraints: { min: number; max: number }[],
): { participant: number; role: number }[] {
  const P = participants.length; // 参加者数
  const M = roles.length; // 実際の役割数

  // 各 role の最小割当の合計のみチェック
  let sumMin = 0;
  let sumMax = 0;
  for (let j = 0; j < M; j++) {
    sumMin += minMaxConstraints[j].min;
    sumMax += minMaxConstraints[j].max;
  }
  if (sumMin > P) {
    throw new Error("割当可能な participant 数が制約を満たしません（sum(min) > participants.length）");
  }

  // 拡張用配列：dummy role を追加するかどうか
  const extendedRoles = roles.slice();
  const extendedConstraints = minMaxConstraints.slice();
  let _dummyAdded = false;
  if (P > sumMax) {
    // 余剰参加者を dummy role に割り当てる
    _dummyAdded = true;
    extendedRoles.push(roles.length); // dummy role のインデックスは元の roles.length
    extendedConstraints.push({ min: 0, max: P - sumMax });
  }
  const M_ext = extendedRoles.length;

  // globalMax は実際の role のスコアのみから算出（dummy roleはスコア0のため無視）
  let globalMax = 0;
  for (let i = 0; i < P; i++) {
    for (let j = 0; j < M; j++) {
      globalMax = Math.max(globalMax, participants[i][j]);
    }
  }

  // --- 各 role（extended）への割当人数の分布 (distribution) を全探索 ---
  // distribution: dist[0..M_ext-1] で、各 extended role j に割り当てる参加者数
  // 条件: extendedConstraints[j].min <= d[j] <= extendedConstraints[j].max,  ∑ d[j] = P
  const distributions: number[][] = [];
  function enumerateDistribution(
    index: number,
    current: number[],
    remaining: number,
  ) {
    if (index === M_ext) {
      if (remaining === 0) {
        distributions.push(current.slice());
      }
      return;
    }
    const { min, max } = extendedConstraints[index];
    for (let d = min; d <= Math.min(max, remaining); d++) {
      current[index] = d;
      enumerateDistribution(index + 1, current, remaining - d);
    }
  }
  enumerateDistribution(0, new Array(M_ext).fill(0), P);

  // --- 各分布ごとに割当問題（参加者と role スロット間の最大重みマッチング）を解く ---
  let bestScore = Number.NEGATIVE_INFINITY;
  type MatchingResult = {
    assignment: number[]; // 各 participant に割り当てられた「スロット番号」
    distribution: number[];
    roleForColumn: number[]; // 各スロットがどの extended role に対応するか
  };
  let bestMatching: MatchingResult | null = null;

  for (const dist of distributions) {
    // 各 extended role j に対して、dist[j] 個のスロットを作成
    const roleForColumn: number[] = [];
    for (let j = 0; j < M_ext; j++) {
      for (let k = 0; k < dist[j]; k++) {
        roleForColumn.push(j);
      }
    }
    if (roleForColumn.length !== P) continue; // 理論上は必ず P になる

    // ホンガリアン法用のコスト行列作成
    // cost[i][col] = globalMax - score  (dummy roleの場合 score=0)
    const costMatrix: number[][] = [];
    for (let i = 0; i < P; i++) {
      costMatrix[i] = [];
      for (let col = 0; col < P; col++) {
        const roleIndex = roleForColumn[col];
        const score = roleIndex < M ? participants[i][roleIndex] : 0;
        costMatrix[i][col] = globalMax - score;
      }
    }

    // ホンガリアン法で最小コスト割当（＝最大スコア割当）を求める
    const assignmentCols = hungarian(costMatrix);
    let totalScore = 0;
    for (let i = 0; i < P; i++) {
      const roleIdx = roleForColumn[assignmentCols[i]];
      totalScore += roleIdx < M ? participants[i][roleIdx] : 0;
    }
    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMatching = {
        assignment: assignmentCols.slice(),
        distribution: dist.slice(),
        roleForColumn: roleForColumn.slice(),
      };
    }
  }

  if (!bestMatching) {
    throw new Error("有効な割当が見つかりません");
  }

  // --- 結果の再構築 ---
  // bestMatching.assignment[i] は participant i に対して割り当てられた「スロット番号」
  // bestMatching.roleForColumn[slot] で、そのスロットがどの extended role に対応するかが分かる
  const result: { participant: number; role: number }[] = [];
  for (let i = 0; i < P; i++) {
    const assignedRole = bestMatching.roleForColumn[bestMatching.assignment[i]];
    // dummy roleの場合は -1 として返す（必要に応じて処理してください）
    result.push({ participant: i, role: assignedRole < M ? assignedRole : -1 });
  }
  return result;
}

/**
 * hungarian
 * ホンガリアン法による、正方行列 cost での最小コスト割当を求める実装
 * cost: cost[i][j] は、i 行目の要素を j 列目に割り当てたときのコスト
 * 戻り値: 各行 i に対して、割当てられた列番号を返す配列
 */
function hungarian(cost: number[][]): number[] {
  const n = cost.length;
  const m = n; // 正方行列を仮定
  const u = new Array(n + 1).fill(0);
  const v = new Array(m + 1).fill(0);
  const p = new Array(m + 1).fill(0);
  const way = new Array(m + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    const minv = new Array(m + 1).fill(Number.POSITIVE_INFINITY);
    const used = new Array(m + 1).fill(false);
    let j0 = 0;
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Number.POSITIVE_INFINITY;
      let j1 = 0;
      for (let j = 1; j <= m; j++) {
        if (!used[j]) {
          const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0);
  }
  const ans = new Array(n);
  for (let j = 1; j <= m; j++) {
    ans[p[j] - 1] = j - 1;
  }
  return ans;
}
