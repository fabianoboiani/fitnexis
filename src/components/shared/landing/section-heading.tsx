import { Badge } from "@/components/ui/badge";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: SectionHeadingProps) {
  const alignmentClass = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";

  return (
    <div className={`space-y-4 ${alignmentClass}`}>
      <Badge
        variant="secondary"
        className="border border-cyan-100 bg-cyan-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-900"
      >
        {eyebrow}
      </Badge>
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
        <p className="text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
      </div>
    </div>
  );
}
