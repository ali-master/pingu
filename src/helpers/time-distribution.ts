/**
 * Creates response time distribution map
 */
export function createTimeDistribution(times: number[]): ReadonlyMap<string, number> {
  if (times.length === 0) return new Map();

  const ranges = new Map<string, number>([
    ["0-50ms", 0],
    ["51-100ms", 0],
    ["101-200ms", 0],
    ["201-500ms", 0],
    ["500ms+", 0],
  ]);

  times.forEach((time) => {
    if (time <= 50) ranges.set("0-50ms", ranges.get("0-50ms")! + 1);
    else if (time <= 100) ranges.set("51-100ms", ranges.get("51-100ms")! + 1);
    else if (time <= 200) ranges.set("101-200ms", ranges.get("101-200ms")! + 1);
    else if (time <= 500) ranges.set("201-500ms", ranges.get("201-500ms")! + 1);
    else ranges.set("500ms+", ranges.get("500ms+")! + 1);
  });

  return ranges;
}
