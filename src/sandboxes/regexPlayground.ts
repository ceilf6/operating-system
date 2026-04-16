export function evaluateRegex(sample: string, pattern: string) {
  try {
    const regex = new RegExp(pattern, "g");
    return {
      matches: Array.from(sample.matchAll(regex)).map((match) => match[0]),
      error: "",
    };
  } catch (error) {
    return { matches: [] as string[], error: error instanceof Error ? error.message : "Invalid regex" };
  }
}

export function awkLikeColumns(sample: string) {
  return sample
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const fields = line.trim().split(/\s+/);
      return { line, fields };
    });
}
