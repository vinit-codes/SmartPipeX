import { AlertCircle } from 'lucide-react';

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rose-200 bg-rose-50/60 p-6 text-center">
      <AlertCircle className="h-5 w-5 text-rose-600" />
      <p className="text-sm font-medium text-rose-800">{message}</p>
    </div>
  );
}
