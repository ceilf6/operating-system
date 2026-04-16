import { useState } from "react";
import { SandboxSpec } from "../../lib/content";
import { awkLikeColumns, evaluateRegex } from "../../sandboxes/regexPlayground";
import { describePermissions, explainLinkDifference } from "../../sandboxes/permissionsMap";
import { simulatePageReplacement } from "../../sandboxes/pageReplacement";
import { detectDeadlock } from "../../sandboxes/resourceGraph";
import { simulateRedirection } from "../../sandboxes/redirectionLab";
import { simulateScheduler } from "../../sandboxes/schedulerTimeline";
import { simulateShellFlow } from "../../sandboxes/shellFlow";
import { decideSyncAction, SyncState } from "../../sandboxes/syncfsDecision";
import { matchSyslogRule, syslogPriorityList } from "../../sandboxes/syslogRuleMatcher";

interface SandboxRegistryProps {
  sandbox: SandboxSpec;
}

const panelClass =
  "rounded-[24px] border border-[rgba(15,31,49,0.1)] bg-white/80 p-4 text-sm leading-7 text-[color:var(--ink-1)]";

function ShellFlowSandbox() {
  const [commandLine, setCommandLine] = useState("ls | grep .md | wc -l");
  const steps = simulateShellFlow(commandLine);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm text-[color:var(--ink-2)]">命令流</span>
        <input
          value={commandLine}
          onChange={(event) => setCommandLine(event.target.value)}
          className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => (
          <article key={`${step.command}-${index}`} className={panelClass}>
            <div className="eyebrow">Step {index + 1}</div>
            <h3 className="page-title mt-3 text-2xl text-[color:var(--ink-1)]">{step.command}</h3>
            <p className="mt-3 text-sm text-[color:var(--ink-2)]">{step.note}</p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-[rgba(15,31,49,0.95)] p-4 text-xs text-white">
              {step.output}
            </pre>
          </article>
        ))}
      </div>
    </div>
  );
}

function PermissionsSandbox() {
  const [octal, setOctal] = useState("754");
  const rows = describePermissions(octal);
  const links = explainLinkDifference();

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <article className={panelClass}>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--ink-2)]">八进制权限</span>
          <input
            value={octal}
            onChange={(event) => setOctal(event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
            className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none"
          />
        </label>
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-2xl border border-[rgba(15,31,49,0.08)] bg-[rgba(246,238,224,0.6)] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--signal-blue)]">{row.label}</div>
              <div className="mt-2 flex gap-3 text-sm">
                <span>{row.read ? "r" : "-"}</span>
                <span>{row.write ? "w" : "-"}</span>
                <span>{row.execute ? "x" : "-"}</span>
              </div>
            </div>
          ))}
        </div>
      </article>
      <article className={panelClass}>
        <div className="eyebrow">链接类型</div>
        <div className="mt-4 space-y-4">
          {links.map((item) => (
            <div key={item.type} className="rounded-2xl border border-[rgba(15,31,49,0.08)] bg-[rgba(255,255,255,0.72)] p-4">
              <h3 className="page-title text-2xl text-[color:var(--ink-1)]">{item.type}</h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--ink-2)]">{item.detail}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function RedirectionSandbox() {
  const [command, setCommand] = useState("grep error");
  const [input, setInput] = useState("error disk full\nwarning auth fail\ninfo boot complete");
  const [stdoutRedirect, setStdoutRedirect] = useState(true);
  const [stderrRedirect, setStderrRedirect] = useState(false);
  const result = simulateRedirection(command, input, stdoutRedirect, stderrRedirect);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <article className={panelClass}>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--ink-2)]">命令</span>
          <select value={command} onChange={(event) => setCommand(event.target.value)} className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none">
            <option value="grep error">grep error</option>
            <option value="wc -l">wc -l</option>
            <option value="sort">sort</option>
          </select>
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm text-[color:var(--ink-2)]">stdin</span>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={8}
            className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none"
          />
        </label>
        <div className="mt-4 flex gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={stdoutRedirect} onChange={(event) => setStdoutRedirect(event.target.checked)} />
            stdout to out.log
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={stderrRedirect} onChange={(event) => setStderrRedirect(event.target.checked)} />
            stderr to err.log
          </label>
        </div>
      </article>
      <article className={panelClass}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[rgba(46,125,91,0.08)] p-4">
            <div className="eyebrow">stdout</div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[rgba(15,31,49,0.95)] p-4 text-xs text-white">{result.stdout}</pre>
          </div>
          <div className="rounded-2xl bg-[rgba(141,74,60,0.08)] p-4">
            <div className="eyebrow">stderr</div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[rgba(15,31,49,0.95)] p-4 text-xs text-white">{result.stderr}</pre>
          </div>
          <div className="rounded-2xl bg-[rgba(52,106,144,0.08)] p-4">
            <div className="eyebrow">out.log</div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[rgba(15,31,49,0.95)] p-4 text-xs text-white">{result.stdoutFile || "(not written)"}</pre>
          </div>
          <div className="rounded-2xl bg-[rgba(192,109,44,0.08)] p-4">
            <div className="eyebrow">err.log</div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-[rgba(15,31,49,0.95)] p-4 text-xs text-white">{result.stderrFile || "(not written)"}</pre>
          </div>
        </div>
      </article>
    </div>
  );
}

function RegexSandbox() {
  const [sample, setSample] = useState("BoB EmpruntE TemporairemenT\nThis document is the third");
  const [pattern, setPattern] = useState("[A-Z][a-zA-Z]+");
  const { matches, error } = evaluateRegex(sample, pattern);
  const columns = awkLikeColumns(sample);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <article className={panelClass}>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--ink-2)]">样本文本</span>
          <textarea value={sample} onChange={(event) => setSample(event.target.value)} rows={8} className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none" />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm text-[color:var(--ink-2)]">正则</span>
          <input value={pattern} onChange={(event) => setPattern(event.target.value)} className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none" />
        </label>
      </article>
      <article className={panelClass}>
        <div className="rounded-2xl border border-[rgba(15,31,49,0.08)] bg-[rgba(255,255,255,0.7)] p-4">
          <div className="eyebrow">匹配结果</div>
          <p className="mt-3 text-sm text-[color:var(--ink-2)]">{error || matches.join(" / ") || "没有匹配。"}</p>
        </div>
        <div className="mt-4 space-y-3">
          {columns.map((row) => (
            <div key={row.line} className="rounded-2xl border border-[rgba(15,31,49,0.08)] bg-[rgba(246,238,224,0.55)] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-[color:var(--signal-blue)]">{row.line}</div>
              <p className="mt-2 text-sm text-[color:var(--ink-1)]">字段: {row.fields.join(" | ")}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function SyslogSandbox() {
  const [rule, setRule] = useState("mail.notice /var/log/mail");
  const [facility, setFacility] = useState("mail");
  const [priority, setPriority] = useState("err");
  const result = matchSyslogRule(rule, facility, priority);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <article className={panelClass}>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--ink-2)]">规则</span>
          <input value={rule} onChange={(event) => setRule(event.target.value)} className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none" />
        </label>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-[color:var(--ink-2)]">facility</span>
            <input value={facility} onChange={(event) => setFacility(event.target.value)} className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-[color:var(--ink-2)]">priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none">
              {syslogPriorityList().map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </article>
      <article className={panelClass}>
        <div className="rounded-2xl border border-[rgba(15,31,49,0.08)] bg-[rgba(255,255,255,0.7)] p-4">
          <div className="eyebrow">判定</div>
          <p className="mt-3 text-2xl text-[color:var(--ink-1)]">{result.matches ? "规则命中" : "规则未命中"}</p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--ink-2)]">{result.explanation}</p>
          <p className="mt-2 text-sm text-[color:var(--signal-blue)]">目标: {result.destination}</p>
        </div>
      </article>
    </div>
  );
}

function PageReplacementSandbox() {
  const [reference, setReference] = useState("1,5,2,5,1,4,1,5,3");
  const [frames, setFrames] = useState(3);
  const [algorithm, setAlgorithm] = useState<"FIFO" | "LRU" | "Clock">("FIFO");
  const result = simulatePageReplacement(reference, frames, algorithm);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <input value={reference} onChange={(event) => setReference(event.target.value)} className="rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none" />
        <input value={frames} onChange={(event) => setFrames(Number(event.target.value) || 1)} type="number" min={1} className="rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none" />
        <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value as "FIFO" | "LRU" | "Clock")} className="rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none">
          <option value="FIFO">FIFO</option>
          <option value="LRU">LRU</option>
          <option value="Clock">Clock</option>
        </select>
      </div>
      <div className={panelClass}>
        <div className="eyebrow">缺页次数</div>
        <p className="mt-3 text-3xl font-semibold text-[color:var(--signal-orange)]">{result.faults}</p>
      </div>
      <div className="overflow-x-auto rounded-[24px] border border-[rgba(15,31,49,0.1)] bg-white/80">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[rgba(15,31,49,0.06)]">
            <tr>
              <th className="px-4 py-3">Step</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Frames</th>
              <th className="px-4 py-3">Fault</th>
            </tr>
          </thead>
          <tbody>
            {result.snapshots.map((snapshot) => (
              <tr key={snapshot.step} className="border-t border-[rgba(15,31,49,0.08)]">
                <td className="px-4 py-3">{snapshot.step}</td>
                <td className="px-4 py-3">{snapshot.reference}</td>
                <td className="px-4 py-3">{snapshot.frames.map((frame) => frame ?? "-").join(" | ")}</td>
                <td className="px-4 py-3">{snapshot.fault ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SchedulerSandbox() {
  const [algorithm, setAlgorithm] = useState<"FCFS" | "SJF" | "RR">("RR");
  const [quantum, setQuantum] = useState(2);
  const [raw, setRaw] = useState("P1,0,5\nP2,1,3\nP3,2,4");
  const processes = raw
    .split("\n")
    .map((line) => line.split(","))
    .filter((parts) => parts.length === 3)
    .map(([id, arrival, burst]) => ({
      id: id.trim(),
      arrival: Number(arrival.trim()),
      burst: Number(burst.trim()),
    }));
  const result = simulateScheduler(processes, algorithm, quantum);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        <textarea value={raw} onChange={(event) => setRaw(event.target.value)} rows={5} className="rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none" />
        <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value as "FCFS" | "SJF" | "RR")} className="rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none">
          <option value="FCFS">FCFS</option>
          <option value="SJF">SJF</option>
          <option value="RR">RR</option>
        </select>
        <input value={quantum} onChange={(event) => setQuantum(Number(event.target.value) || 1)} type="number" min={1} className="rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none" />
      </div>
      <div className={panelClass}>
        <div className="eyebrow">Timeline</div>
        <div className="mt-4 flex flex-wrap gap-3">
          {result.segments.map((segment, index) => (
            <div key={`${segment.id}-${segment.start}-${index}`} className="rounded-2xl bg-[rgba(52,106,144,0.08)] px-4 py-3">
              {segment.id}: {segment.start} - {segment.end}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {result.metrics.map((metric) => (
          <div key={metric.id} className={panelClass}>
            <div className="eyebrow">{metric.id}</div>
            <p className="mt-3">Turnaround: {metric.turnaround}</p>
            <p>Waiting: {metric.waiting}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceGraphSandbox() {
  const [allocationsInput, setAllocationsInput] = useState("R1->P1,R2->P2");
  const [requestsInput, setRequestsInput] = useState("P1->R2,P2->R1");

  const parseEdges = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.split("->"))
      .filter((parts) => parts.length === 2)
      .map(([from, to]) => ({ from: from.trim(), to: to.trim() }));

  const result = detectDeadlock(parseEdges(allocationsInput), parseEdges(requestsInput));

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <article className={panelClass}>
        <label className="block">
          <span className="mb-2 block text-sm text-[color:var(--ink-2)]">分配边 (R to P)</span>
          <input value={allocationsInput} onChange={(event) => setAllocationsInput(event.target.value)} className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none" />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm text-[color:var(--ink-2)]">请求边 (P to R)</span>
          <input value={requestsInput} onChange={(event) => setRequestsInput(event.target.value)} className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none" />
        </label>
      </article>
      <article className={panelClass}>
        <div className="eyebrow">Wait-for Graph</div>
        <p className="mt-3 text-2xl text-[color:var(--ink-1)]">{result.hasDeadlock ? "检测到死锁环" : "当前没有死锁环"}</p>
        <p className="mt-3 text-sm leading-7 text-[color:var(--ink-2)]">
          Wait edges: {result.waitEdges.map((edge) => `${edge.from} to ${edge.to}`).join(", ") || "(none)"}
        </p>
        {result.cycle.length ? <p className="mt-2 text-sm text-[color:var(--signal-red)]">Cycle: {result.cycle.join(" to ")}</p> : null}
      </article>
    </div>
  );
}

function SyncFSSandbox() {
  const [aState, setAState] = useState<SyncState>("journal");
  const [bState, setBState] = useState<SyncState>("modified");
  const [contentEqual, setContentEqual] = useState(false);
  const decision = decideSyncAction(aState, bState, contentEqual);

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <article className={panelClass}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-[color:var(--ink-2)]">A 状态</span>
            <select value={aState} onChange={(event) => setAState(event.target.value as SyncState)} className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none">
              <option value="journal">journal</option>
              <option value="modified">modified</option>
              <option value="missing">missing</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-[color:var(--ink-2)]">B 状态</span>
            <select value={bState} onChange={(event) => setBState(event.target.value as SyncState)} className="w-full rounded-2xl border border-[rgba(15,31,49,0.12)] bg-white px-4 py-3 outline-none">
              <option value="journal">journal</option>
              <option value="modified">modified</option>
              <option value="missing">missing</option>
            </select>
          </label>
        </div>
        <label className="mt-4 flex items-center gap-2">
          <input type="checkbox" checked={contentEqual} onChange={(event) => setContentEqual(event.target.checked)} />
          双方内容相同
        </label>
      </article>
      <article className={panelClass}>
        <div className="eyebrow">Decision</div>
        <p className="mt-3 text-3xl text-[color:var(--ink-1)]">{decision.action}</p>
        <p className="mt-4 text-sm leading-7 text-[color:var(--ink-2)]">{decision.reason}</p>
      </article>
    </div>
  );
}

export function SandboxRegistry({ sandbox }: SandboxRegistryProps) {
  switch (sandbox.slug) {
    case "shell-flow":
      return <ShellFlowSandbox />;
    case "permissions-map":
      return <PermissionsSandbox />;
    case "redirection-lab":
      return <RedirectionSandbox />;
    case "regex-playground":
      return <RegexSandbox />;
    case "syslog-rule-matcher":
      return <SyslogSandbox />;
    case "page-replacement":
      return <PageReplacementSandbox />;
    case "scheduler-timeline":
      return <SchedulerSandbox />;
    case "resource-graph":
      return <ResourceGraphSandbox />;
    case "syncfs-decision":
      return <SyncFSSandbox />;
    default:
      return <div className={panelClass}>这个沙箱还没有挂接渲染器。</div>;
  }
}
