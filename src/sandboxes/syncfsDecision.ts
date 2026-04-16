export type SyncState = "journal" | "modified" | "missing";

export function decideSyncAction(aState: SyncState, bState: SyncState, contentEqual: boolean) {
  if (aState === "missing" && bState === "missing") {
    return { action: "noop", reason: "两边都不存在该路径，不需要同步。" };
  }
  if (aState === "missing" || bState === "missing") {
    return {
      action: "copy-present-side",
      reason: "一侧缺失而另一侧存在，课程实现会尽量复制现存一侧到缺失侧。",
    };
  }
  if (aState === "journal" && bState === "modified") {
    return { action: "copy-b-to-a", reason: "A 符合日志，说明 B 是新版本，执行 B -> A。" };
  }
  if (aState === "modified" && bState === "journal") {
    return { action: "copy-a-to-b", reason: "B 符合日志，说明 A 是新版本，执行 A -> B。" };
  }
  if (aState === "modified" && bState === "modified") {
    if (contentEqual) {
      return { action: "metadata-only", reason: "双方内容相同，只需要同步元数据或记为 metadata-only conflict。" };
    }
    return { action: "conflict", reason: "双方都改动且内容不同，应报告 content conflict。" };
  }
  return { action: "synced", reason: "当前状态可以视为已同步。" };
}
