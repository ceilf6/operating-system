import clsx from "clsx";
import { ArrowUpRight, MessageSquareMore, ShieldQuestion } from "lucide-react";
import type { CommunityAction } from "../../content/site/community";
import {
  type CommunityRouteContext,
  resolveCommunityAction,
} from "../../lib/community";

interface CommunityActionGroupProps {
  actions: CommunityAction[];
  context: CommunityRouteContext;
  className?: string;
}

function getActionIcon(kind: CommunityAction["kind"]) {
  switch (kind) {
    case "discussion":
      return MessageSquareMore;
    case "form":
      return ShieldQuestion;
    default:
      return ArrowUpRight;
  }
}

export function CommunityActionGroup({
  actions,
  context,
  className,
}: CommunityActionGroupProps) {
  return (
    <div className={clsx("flex flex-wrap gap-3", className)}>
      {actions.map((action) => {
        const resolvedAction = resolveCommunityAction(action, context);
        const Icon = getActionIcon(action.kind);
        const label =
          resolvedAction.disabled && action.kind === "form"
            ? `${action.label}（待配置）`
            : action.label;

        if (resolvedAction.disabled || !resolvedAction.resolvedHref) {
          return (
            <span
              key={action.id}
              title={resolvedAction.disabledReason}
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-[rgba(15,31,49,0.16)] bg-[rgba(255,252,247,0.72)] px-4 py-2 text-sm text-[color:var(--ink-2)] opacity-70"
            >
              <Icon className="h-4 w-4" />
              {label}
            </span>
          );
        }

        return (
          <a
            key={action.id}
            href={resolvedAction.resolvedHref}
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noreferrer noopener" : undefined}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,31,49,0.12)] bg-white/88 px-4 py-2 text-sm text-[color:var(--ink-1)] transition hover:-translate-y-0.5 hover:border-[rgba(52,106,144,0.28)] hover:bg-white"
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        );
      })}
    </div>
  );
}
