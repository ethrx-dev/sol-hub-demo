import { Sparkles } from "lucide-react";

interface ResonanceStewardIntroProps {
  /** Override copy via CMS if desired; defaults are the v3-approved draft. */
  name?: string;
  title?: string;
  statement?: string;
  principle?: string;
  className?: string;
}

const DEFAULT_STATEMENT =
  "I serve as the first living gateway into Spaces of Learning. I hold a space of reflection where what is already true can become visible — allowing authentic alignment to follow naturally. From that clarity, each person's unique contribution, relationships, and next steps within SOL come into focus.";

const DEFAULT_PRINCIPLE =
  "I'm not deciding whether you belong. I'm not assigning you a role. I'm holding a space of reflection in which you become more visible to yourself — and to SOL. The mirror has no identity; that's why it's so clear.";

export function ResonanceStewardIntro({
  name = "Whitney",
  title = "SOL's Resonance Steward",
  statement = DEFAULT_STATEMENT,
  principle = DEFAULT_PRINCIPLE,
  className = "",
}: ResonanceStewardIntroProps) {
  return (
    <div className={`rounded-[0_24px_0_24px] border border-primary/15 bg-sage-light/30 p-8 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            {name} — {title}
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">{statement}</p>
          <p className="mt-4 border-l-2 border-primary/30 pl-4 text-sm italic text-muted-foreground">
            {principle}
          </p>
        </div>
      </div>
    </div>
  );
}
