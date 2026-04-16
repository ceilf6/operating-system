export interface PermissionRow {
  label: string;
  read: boolean;
  write: boolean;
  execute: boolean;
}

function digitToPermissions(digit: number): PermissionRow["read" | "write" | "execute"][] {
  return [Boolean(digit & 4), Boolean(digit & 2), Boolean(digit & 1)];
}

export function describePermissions(octal: string): PermissionRow[] {
  const digits = octal.padStart(3, "0").slice(-3).split("").map((value) => Number(value) || 0);
  const labels = ["Owner", "Group", "Other"];
  return digits.map((digit, index) => {
    const [read, write, execute] = digitToPermissions(digit);
    return { label: labels[index], read, write, execute };
  });
}

export function explainLinkDifference() {
  return [
    {
      type: "硬链接",
      detail: "多个目录项共享同一个 inode，删除原文件名后仍可通过另一条目录项访问数据。",
    },
    {
      type: "符号链接",
      detail: "本质是保存目标路径的特殊文件，目标被删除后链接会失效。",
    },
  ];
}
