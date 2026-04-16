export interface PageSnapshot {
  step: number;
  reference: number;
  frames: Array<number | null>;
  fault: boolean;
}

function fifo(reference: number[], frameCount: number) {
  const frames: Array<number | null> = Array(frameCount).fill(null);
  let pointer = 0;
  return reference.map((page, step) => {
    const fault = !frames.includes(page);
    if (fault) {
      frames[pointer] = page;
      pointer = (pointer + 1) % frameCount;
    }
    return { step: step + 1, reference: page, frames: [...frames], fault };
  });
}

function lru(reference: number[], frameCount: number) {
  const frames: Array<number | null> = Array(frameCount).fill(null);
  const lastUsed = new Map<number, number>();
  return reference.map((page, step) => {
    const fault = !frames.includes(page);
    if (fault) {
      const emptyIndex = frames.indexOf(null);
      if (emptyIndex >= 0) {
        frames[emptyIndex] = page;
      } else {
        let victimIndex = 0;
        let oldest = Number.MAX_SAFE_INTEGER;
        frames.forEach((value, index) => {
          const used = lastUsed.get(value ?? 0) ?? -1;
          if (used < oldest) {
            oldest = used;
            victimIndex = index;
          }
        });
        frames[victimIndex] = page;
      }
    }
    lastUsed.set(page, step);
    return { step: step + 1, reference: page, frames: [...frames], fault };
  });
}

function clock(reference: number[], frameCount: number) {
  const frames: Array<number | null> = Array(frameCount).fill(null);
  const refBits: number[] = Array(frameCount).fill(0);
  let pointer = 0;

  return reference.map((page, step) => {
    const hitIndex = frames.indexOf(page);
    const fault = hitIndex === -1;
    if (!fault) {
      refBits[hitIndex] = 1;
    } else {
      while (refBits[pointer] === 1) {
        refBits[pointer] = 0;
        pointer = (pointer + 1) % frameCount;
      }
      frames[pointer] = page;
      refBits[pointer] = 1;
      pointer = (pointer + 1) % frameCount;
    }
    return { step: step + 1, reference: page, frames: [...frames], fault };
  });
}

export function simulatePageReplacement(referenceString: string, frameCount: number, algorithm: "FIFO" | "LRU" | "Clock") {
  const reference = referenceString
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

  const snapshots =
    algorithm === "LRU"
      ? lru(reference, frameCount)
      : algorithm === "Clock"
        ? clock(reference, frameCount)
        : fifo(reference, frameCount);

  return {
    snapshots,
    faults: snapshots.filter((item) => item.fault).length,
  };
}
