// @ts-nocheck

/****************************************************
 * matchInternsExactlyK.ts
 ****************************************************/

// 最小費用流の基本クラス (前回とほぼ同様)
// Successive Shortest Path (ポテンシャル+Dijkstra) の簡易実装
class Edge {
  constructor(
    public to: number,
    public rev: number,
    public capacity: number,
    public cost: number,
  ) {}
}

class MinCostFlow {
  private graph: Edge[][];

  constructor(private n: number) {
    this.graph = Array.from({ length: n }, () => []);
  }

  addEdge(u: number, v: number, capacity: number, cost: number) {
    this.graph[u].push(new Edge(v, this.graph[v].length, capacity, cost));
    this.graph[v].push(new Edge(u, this.graph[u].length - 1, 0, -cost));
  }

  /**
   * 通常の minCostMaxFlow: 流せるだけ流して最小費用を求める。
   * 戻り値: [最大流, 最小費用]
   */
  minCostMaxFlow(s: number, t: number): [number, number] {
    const INF = Number.MAX_SAFE_INTEGER;
    let flow = 0;
    let cost = 0;
    const potential = new Array(this.n).fill(0);

    while (true) {
      // Dijkstra (ポテンシャル込み)
      const dist = new Array(this.n).fill(INF);
      dist[s] = 0;
      const used = new Array(this.n).fill(false);
      const parentV = new Array(this.n).fill(-1);
      const parentE = new Array(this.n).fill(-1);

      for (let _ = 0; _ < this.n; _++) {
        let u = -1;
        let minDist = INF;
        for (let i = 0; i < this.n; i++) {
          if (!used[i] && dist[i] < minDist) {
            minDist = dist[i];
            u = i;
          }
        }
        if (u === -1) break;
        used[u] = true;

        for (let eIdx = 0; eIdx < this.graph[u].length; eIdx++) {
          const e = this.graph[u][eIdx];
          if (e.capacity > 0 && !used[e.to]) {
            const costVal = dist[u] + e.cost + potential[u] - potential[e.to];
            if (costVal < dist[e.to]) {
              dist[e.to] = costVal;
              parentV[e.to] = u;
              parentE[e.to] = eIdx;
            }
          }
        }
      }

      if (dist[t] === INF) {
        break; // これ以上流せない
      }
      // ポテンシャル更新
      for (let i = 0; i < this.n; i++) {
        if (dist[i] < INF) potential[i] += dist[i];
      }
      // パスに沿って流せるだけ流す
      let addFlow = INF;
      for (let v = t; v !== s; v = parentV[v]) {
        const e = this.graph[parentV[v]][parentE[v]];
        addFlow = Math.min(addFlow, e.capacity);
      }
      for (let v = t; v !== s; v = parentV[v]) {
        const e = this.graph[parentV[v]][parentE[v]];
        e.capacity -= addFlow;
        this.graph[v][e.rev].capacity += addFlow;
        cost += addFlow * e.cost;
      }
      flow += addFlow;
    }
    return [flow, cost];
  }

  /**
   * "ちょうど targetFlow 分だけ流したい" という用途向け。
   * 可能な限り流して、flow < targetFlow のままなら不可能。
   *
   * 戻り値: [実際に流したフロー, そのときの費用]
   */
  minCostFlowWithTarget(
    s: number,
    t: number,
    targetFlow: number,
  ): [number, number] {
    const INF = Number.MAX_SAFE_INTEGER;
    let flow = 0;
    let cost = 0;
    const potential = new Array(this.n).fill(0);

    while (flow < targetFlow) {
      // Dijkstra (ポテンシャル込み)
      const dist = new Array(this.n).fill(INF);
      dist[s] = 0;
      const used = new Array(this.n).fill(false);
      const parentV = new Array(this.n).fill(-1);
      const parentE = new Array(this.n).fill(-1);

      for (let _ = 0; _ < this.n; _++) {
        let u = -1;
        let minDist = INF;
        for (let i = 0; i < this.n; i++) {
          if (!used[i] && dist[i] < minDist) {
            minDist = dist[i];
            u = i;
          }
        }
        if (u === -1) break;
        used[u] = true;

        for (let eIdx = 0; eIdx < this.graph[u].length; eIdx++) {
          const e = this.graph[u][eIdx];
          if (e.capacity > 0 && !used[e.to]) {
            const costVal = dist[u] + e.cost + potential[u] - potential[e.to];
            if (costVal < dist[e.to]) {
              dist[e.to] = costVal;
              parentV[e.to] = u;
              parentE[e.to] = eIdx;
            }
          }
        }
      }

      if (dist[t] === INF) {
        // もう増やせない
        break;
      }

      // ポテンシャル更新
      for (let i = 0; i < this.n; i++) {
        if (dist[i] < INF) potential[i] += dist[i];
      }

      // パスに沿って流せるだけ流す
      let addFlow = targetFlow - flow; // 残り流したい量
      for (let v = t; v !== s; v = parentV[v]) {
        const e = this.graph[parentV[v]][parentE[v]];
        addFlow = Math.min(addFlow, e.capacity);
      }
      for (let v = t; v !== s; v = parentV[v]) {
        const e = this.graph[parentV[v]][parentE[v]];
        e.capacity -= addFlow;
        this.graph[v][e.rev].capacity += addFlow;
        cost += addFlow * e.cost;
      }
      flow += addFlow;
    }

    return [flow, cost];
  }

  public getGraph() {
    return this.graph;
  }
}

// ============= 入出力データの型定義 =============
interface Participant {
  id: string;
  rolesCount: number; // 必ずこの数だけ所属する (最小=最大)
  preferences: {
    roleId: string;
    score: number; // 1〜5等
  }[];
}

interface Role {
  id: string;
  capacity: number; // 受け入れ最大数
}

/**
 * 研修医が必ず exactly (exactHospitals) 個の病院に所属する
 * という制約下での最小費用流マッチング。
 */
function matchInternsExactlyK(
  participants: Participant[],
  roles: Role[],
): {
  matching: { participantId: string; roleIds: string[] }[];
  totalFlow: number;
  totalCost: number;
  feasible: boolean;
} {
  const nInterns = participants.length;
  const nHospitals = roles.length;

  // ソース=0, 研修医 i = 1..nInterns, 病院 j = nInterns+1..nInterns+nHospitals, シンク=最後
  const source = 0;
  const sink = nInterns + nHospitals + 1;

  const mcf = new MinCostFlow(sink + 1); // 頂点数

  // 病院ID -> ノード番号
  const hospitalIndexMap: { [id: string]: number } = {};
  roles.forEach((h, j) => {
    hospitalIndexMap[h.id] = nInterns + 1 + j;
  });

  // 1) ソース -> 研修医 i (容量 = exactHospitals[i], cost = 0)
  let requiredFlow = 0;
  participants.forEach((intern, i) => {
    const internNode = i + 1;
    mcf.addEdge(source, internNode, intern.rolesCount, 0);
    requiredFlow += intern.rolesCount;
  });

  // 2) 研修医 i -> 病院 j (容量 = 1, cost = 例: 6 - rating)
  participants.forEach((intern, i) => {
    const internNode = i + 1;
    for (const pref of intern.preferences) {
      const hospitalNode = hospitalIndexMap[pref.roleId];
      if (hospitalNode === undefined) continue;
      const cost = 6 - pref.score;
      mcf.addEdge(internNode, hospitalNode, 1, cost);
    }
  });

  // 3) 病院 j -> シンク (容量 = hospital.capacity, cost=0)
  roles.forEach((h, j) => {
    const hospitalNode = nInterns + 1 + j;
    mcf.addEdge(hospitalNode, sink, h.capacity, 0);
  });

  // 4) ちょうど requiredFlow を流す
  const [flow, cost] = mcf.minCostFlowWithTarget(source, sink, requiredFlow);

  if (flow < requiredFlow) {
    // 必要なフロー量を流しきれず、不可能
    return {
      matching: participants.map((it) => ({
        participantId: it.id,
        roleIds: [],
      })),
      totalFlow: flow,
      totalCost: cost,
      feasible: false,
    };
  }

  // 5) マッチング結果の復元:
  //    「研修医 i -> 病院 j」辺で流量が1あれば i は j に所属。
  //    流量判定: 逆辺の capacity が 1増えていれば流れたとみなせる。
  const result = participants.map((it) => ({
    participantId: it.id,
    roleIds: [] as string[],
  }));
  const graph = mcf.getGraph();
  participants.forEach((intern, i) => {
    const internNode = i + 1;
    for (const e of graph[internNode]) {
      const hospitalIdx = e.to - (nInterns + 1);
      if (hospitalIdx >= 0 && hospitalIdx < nHospitals) {
        // 逆辺
        const revEdge = graph[e.to][e.rev];
        // revEdge.capacity が「実際に流れた量(=1)」だけ増えていれば割り当て
        if (revEdge.capacity > 0) {
          // intern i -> hospital j にフロー1
          const hId = roles[hospitalIdx].id;
          result[i].roleIds.push(hId);
        }
      }
    }
  });

  return {
    matching: result,
    totalFlow: flow,
    totalCost: cost,
    feasible: true,
  };
}

/*******************************************************
 * 使用例
 *******************************************************/
export function multipleMatch(interns: Participant[], roles: Role[]) {
  //   const interns: Participant[] = [
  //     {
  //       id: "I1",
  //       rolesCount: 3, // 必ず2つの病院に所属
  //       preferences: [
  //         { roleId: "H1", score: 5 },
  //         { roleId: "H2", score: 2 },
  //       ],
  //     },
  //     {
  //       id: "I2",
  //       rolesCount: 1, // 必ず1つの病院に所属
  //       preferences: [
  //         { roleId: "H1", score: 1 },
  //         { roleId: "H2", score: 5 },
  //       ],
  //     },
  //   ];

  //   const roles: Role[] = [
  //     { id: "H1", capacity: 2 },
  //     { id: "H2", capacity: 2 },
  //   ];

  const { matching, totalFlow, totalCost, feasible } = matchInternsExactlyK(
    interns,
    roles,
  );

  return matching;

  //   console.log("feasible:", feasible);
  //   console.log("flow:", totalFlow, "cost:", totalCost);
  //   for (let m of matching) {
  //     console.log(`Intern ${m.participantId} => [${m.roleIds.join(", ")}]`);
  //   }
}
// main();
