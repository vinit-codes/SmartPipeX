import { Database, Radio, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { DataSource } from '@/lib/types';

const sourceConfig = {
  esp32: {
    label: 'ESP32 hardware',
    icon: Radio,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  database: {
    label: 'MongoDB',
    icon: Database,
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  simulation: {
    label: 'Simulation mode',
    icon: Waves,
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
} as const;

export function SourceBadge({ source }: { source: DataSource }) {
  const config = sourceConfig[source];
  const Icon = config.icon;
  return (
    <Badge className={config.className}>
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
