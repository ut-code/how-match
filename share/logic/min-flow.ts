//@ts-nocheck

/**
 * 各 participant を 1 つの role に割り当て、各 role の割当人数が min, max を満たす中で総スコアが最大になる割当を返す。
 * @param participants 各参加者が各 role に対して与えたスコアの 2 次元配列 （participants[i][j] が participant i の role j に対するスコア）
 * @param countRoles role の数
 * @param minMaxConstraints 各 role に対する { min, max } 制約
 * @description sum(min) <= participants.length であることを前提とし、もし participants.length > sum(max) であれば、余剰参加者は dummy role（score=0）に割り当てます。
 * @returns
 */
export function assignRoles(
  participants: number[][],
  countRoles: number,
  minMaxConstraints: { min: number; max: number }[],
): { participant: number; role: number }[] {
  console.log(participants, countRoles, minMaxConstraints);

  const P = participants.length; // 参加者数
  const M = countRoles; // 実際の役割数

  // 各 role の最小割当の合計のみチェック
  let sumMin = 0;
  let sumMax = 0;
  for (let j = 0; j < M; j++) {
    sumMin += minMaxConstraints[j]?.min ?? 0;
    sumMax += minMaxConstraints[j]?.max ?? 0;
  }
  if (sumMin > P) {
    throw new Error("割当可能な participant 数が制約を満たしません（sum(min) > participants.length）");
  }

  // 拡張用配列：dummy role を追加するかどうか
  // const extendedRoles = countRoles.slice();
  const extendedConstraints = minMaxConstraints.slice();
  let _dummyAdded = false;
  let M_ext = countRoles;
  if (P > sumMax) {
    // 余剰参加者を dummy role に割り当てる
    _dummyAdded = true;
    // extendedRoles.push("dummy"); // dummy role のインデックスは元の roles.length
    M_ext++;

    extendedConstraints.push({ min: 0, max: P - sumMax });
  }

  // globalMax は実際の role のスコアのみから算出（dummy roleはスコア0のため無視）
  let globalMax = 0;
  for (let i = 0; i < P; i++) {
    if (!participants[i]) break;
    for (let j = 0; j < M; j++) {
      if (participants[i]?.[j] === undefined) break;
      globalMax = Math.max(globalMax);
    }
  }

  // --- 各 role（extended）への割当人数の分布 (distribution) を全探索 ---
  // distribution: dist[0..M_ext-1] で、各 extended role j に割り当てる参加者数
  // 条件: extendedConstraints[j].min <= d[j] <= extendedConstraints[j].max,  ∑ d[j] = P
  const distributions: number[][] = [];
  function enumerateDistribution(index: number, current: number[], remaining: number) {
    if (index === M_ext) {
      if (remaining === 0) {
        distributions.push(current.slice());
      }
      return;
    }
    if (extendedConstraints[index] === undefined) return;
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
