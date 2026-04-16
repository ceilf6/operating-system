export interface RedirectionResult {
  stdout: string;
  stderr: string;
  stdoutFile: string;
  stderrFile: string;
}

export function simulateRedirection(command: string, input: string, redirectStdout: boolean, redirectStderr: boolean): RedirectionResult {
  let stdout = "";
  let stderr = "";

  if (command === "grep error") {
    const lines = input.split("\n");
    stdout = lines.filter((line) => line.includes("error")).join("\n");
    stderr = lines.some((line) => line.includes("warn")) ? "warning lines are ignored in grep error mode" : "";
  } else if (command === "wc -l") {
    stdout = String(input.split("\n").filter(Boolean).length);
  } else if (command === "sort") {
    stdout = input.split("\n").filter(Boolean).sort().join("\n");
  }

  return {
    stdout: redirectStdout ? "(stdout redirected to out.log)" : stdout || "(empty)",
    stderr: redirectStderr ? "(stderr redirected to err.log)" : stderr || "(empty)",
    stdoutFile: redirectStdout ? stdout || "(empty)" : "",
    stderrFile: redirectStderr ? stderr || "(empty)" : "",
  };
}
