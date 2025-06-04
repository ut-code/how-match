export function remove<T>(mut_arr: T[], elem: T) {
  for (let i = mut_arr.length - 1; i >= 0; i--) {
    if (mut_arr[i] === elem) {
      mut_arr.splice(i, 1);
    }
  }
}
// Fisher-Yates shuffle https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
export function shuffle<T>(mut_arr: T[]) {
  for (let i = mut_arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = mut_arr[i];
    mut_arr[i] = mut_arr[j];
    mut_arr[j] = tmp;
  }
}
