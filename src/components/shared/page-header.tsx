import { Badge } from "@/components/ui/badge";
import { BRAND_COPY, BRAND_NAME } from "@/lib/branding";

type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-3">
      <Badge variant="secondary">{`${BRAND_NAME} - ${BRAND_COPY.institutional.headerBadge}`}</Badge>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}
