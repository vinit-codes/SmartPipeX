import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { SensorReading } from '@/lib/types';
import { cn } from '@/utils';

export function LeakStatus({ reading }: { reading: SensorReading }) {
  const leaking = reading.leakDetected;
  return (
    <Card
      className={cn(
        'overflow-hidden border-0 p-6 text-white',
        leaking
          ? 'bg-gradient-to-br from-rose-600 to-orange-500'
          : 'bg-gradient-to-br from-slate-950 to-slate-800'
      )}
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
            Pipeline status
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            {leaking ? `${reading.severity?.toUpperCase()} leak detected` : 'Flow is within threshold'}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/70">
            {leaking
              ? `${reading.waterLoss.toFixed(2)} L/min is not reaching the output sensor. Inspect the monitored section.`
              : 'Input and output readings are aligned. SmartPipeX will continue checking for abnormal flow loss.'}
          </p>
        </div>
        <span className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
          {leaking ? (
            <AlertTriangle className="h-7 w-7" />
          ) : (
            <CheckCircle2 className="h-7 w-7" />
          )}
        </span>
      </div>
      <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-sm">
        <div>
          <p className="text-white/55">Loss</p>
          <p className="mt-1 font-semibold">{reading.waterLoss.toFixed(2)} L/min</p>
        </div>
        <div>
          <p className="text-white/55">Loss rate</p>
          <p className="mt-1 font-semibold">{reading.lossPercentage.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-white/55">Score</p>
          <p className="mt-1 font-semibold">{reading.severityScore.toFixed(1)}/10</p>
        </div>
      </div>
    </Card>
  );
}
