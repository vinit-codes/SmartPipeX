import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils';

export function MetricCard({
  title,
  value,
  unit,
  description,
  icon: Icon,
  tone = 'sky',
}: {
  title: string;
  value: string;
  unit?: string;
  description: string;
  icon: LucideIcon;
  tone?: 'sky' | 'emerald' | 'amber' | 'rose';
}) {
  const tones = {
    sky: 'bg-sky-50 text-sky-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
            {unit && <span className="ml-1 text-sm font-medium text-slate-500">{unit}</span>}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <span className={cn('rounded-xl p-2.5', tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}
