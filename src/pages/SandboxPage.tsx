import { useParams } from "react-router-dom";
import { SandboxFrame } from "../components/sandbox/SandboxFrame";
import { SandboxRegistry } from "../components/sandbox/SandboxRegistry";
import { getSandboxBySlug } from "../lib/content";

export function SandboxPage() {
  const { sandboxSlug } = useParams();
  const sandbox = getSandboxBySlug(sandboxSlug);

  if (!sandbox) {
    return (
      <div className="glass-card rounded-[32px] p-8">
        <h1 className="page-title text-4xl text-[color:var(--ink-1)]">沙箱不存在</h1>
      </div>
    );
  }

  return (
    <SandboxFrame
      title={sandbox.title}
      summary={sandbox.summary}
      conceptTargets={sandbox.conceptTargets}
      limitations={sandbox.limitations}
    >
      <SandboxRegistry sandbox={sandbox} />
    </SandboxFrame>
  );
}
