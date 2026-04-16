const FILES: Record<string, string> = {
  "README.md": "Linux shell basics\nsyslog matcher\npage replacement\n",
  "notes.txt": "fifo lru clock\nprocess scheduling\nauth warning\n",
  "errors.log": "warning auth failure\nerror disk full\ninfo boot complete\n",
};

export interface ShellStep {
  command: string;
  output: string;
  note: string;
}

function runSingle(command: string, input: string, cwd: string) {
  const [name, ...args] = command.trim().split(/\s+/);
  switch (name) {
    case "pwd":
      return { output: cwd, note: "显示当前工作目录。" };
    case "ls":
      return { output: Object.keys(FILES).join("\n"), note: "列出模拟目录中的文件。" };
    case "cat":
      return {
        output: FILES[args[0] ?? "README.md"] ?? "No such file",
        note: "读取模拟文件内容。",
      };
    case "grep": {
      const pattern = args.join(" ");
      const lines = input.split("\n").filter((line) => line.includes(pattern));
      return { output: lines.join("\n"), note: "按关键字过滤上一条命令的输出。" };
    }
    case "wc":
      if (args[0] === "-l") {
        const count = input ? input.split("\n").filter(Boolean).length : 0;
        return { output: String(count), note: "统计上一条输出的行数。" };
      }
      return { output: String(input.length), note: "统计字符数。" };
    case "head": {
      const count = Number(args[1] ?? 3);
      return {
        output: input.split("\n").slice(0, count).join("\n"),
        note: "截取前几行，便于快速预览文本。",
      };
    }
    case "tail": {
      const count = Number(args[1] ?? 3);
      return {
        output: input.split("\n").slice(-count).join("\n"),
        note: "查看末尾几行，常用于日志。",
      };
    }
    case "sort":
      return { output: input.split("\n").filter(Boolean).sort().join("\n"), note: "按字典序排序。" };
    default:
      return { output: `Unsupported command: ${command}`, note: "该模拟器只覆盖课程中高频命令。" };
  }
}

export function simulateShellFlow(commandLine: string, cwd = "/home/student"): ShellStep[] {
  let current = "";
  return commandLine
    .split("|")
    .map((command) => command.trim())
    .filter(Boolean)
    .map((command) => {
      const result = runSingle(command, current, cwd);
      current = result.output;
      return { command, output: result.output || "(empty)", note: result.note };
    });
}
