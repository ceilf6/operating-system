const priorities = ["debug", "info", "notice", "warning", "err", "crit", "alert", "emerg"];

export function matchSyslogRule(rule: string, facility: string, priority: string) {
  const [selector, destination = "/var/log/messages"] = rule.trim().split(/\s+/, 2);
  const [facilitySelector = "*", prioritySelector = "debug"] = selector.split(".");

  const facilityMatches = facilitySelector === "*" || facilitySelector.split(",").includes(facility);
  const selectedIndex = priorities.indexOf(prioritySelector.replace("!", "").replace("=", ""));
  const priorityIndex = priorities.indexOf(priority);

  const priorityMatches =
    prioritySelector.startsWith("!=")
      ? priority !== prioritySelector.slice(2)
      : prioritySelector.startsWith("!")
        ? priorityIndex < selectedIndex
        : priorityIndex >= selectedIndex;

  return {
    matches: facilityMatches && priorityMatches,
    destination,
    explanation: facilityMatches
      ? `facility 命中，比较结果为 ${priority} ${priorityMatches ? "满足" : "不满足"} ${prioritySelector}。`
      : "facility 不匹配，规则不会触发。",
  };
}

export function syslogPriorityList() {
  return priorities;
}
