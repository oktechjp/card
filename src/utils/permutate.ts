export function permutate<T>(arr: T[], count: number) {
  let current = arr.map((t) => [t]);
  for (let i = 1; i < count; i++) {
    const next: T[][] = [];
    for (const curr of current) {
      for (let entry of arr) {
        next.push([...curr, entry]);
      }
    }
    current = next;
  }
  return current;
}
