import type { EnvVariable, DiffEntry, DiffResult } from '@/types';

export function diffEnvFiles(
  left: EnvVariable[],
  right: EnvVariable[]
): DiffResult {
  const leftMap = new Map<string, EnvVariable>();
  const rightMap = new Map<string, EnvVariable>();

  for (const v of left) leftMap.set(v.key, v);
  for (const v of right) rightMap.set(v.key, v);

  const allKeys = new Set([...leftMap.keys(), ...rightMap.keys()]);
  const entries: DiffEntry[] = [];

  let added = 0;
  let removed = 0;
  let changed = 0;
  let same = 0;

  for (const key of allKeys) {
    const lv = leftMap.get(key);
    const rv = rightMap.get(key);

    if (lv && rv) {
      if (lv.value === rv.value) {
        entries.push({
          key,
          leftValue: lv.value,
          rightValue: rv.value,
          status: 'same',
          leftLine: lv.line,
          rightLine: rv.line,
        });
        same++;
      } else {
        entries.push({
          key,
          leftValue: lv.value,
          rightValue: rv.value,
          status: 'changed',
          leftLine: lv.line,
          rightLine: rv.line,
        });
        changed++;
      }
    } else if (lv && !rv) {
      entries.push({
        key,
        leftValue: lv.value,
        status: 'removed',
        leftLine: lv.line,
      });
      removed++;
    } else if (rv && !lv) {
      entries.push({
        key,
        rightValue: rv.value,
        status: 'added',
        rightLine: rv.line,
      });
      added++;
    }
  }

  // Sort: changed first, then added, removed, same
  const order = { changed: 0, added: 1, removed: 2, same: 3 };
  entries.sort((a, b) => order[a.status] - order[b.status]);

  return { entries, added, removed, changed, same };
}
