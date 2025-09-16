import { Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';

export function LucoWifiLogo({ className, ...props }: LucideProps) {
  return (
    <div className={cn("flex items-center justify-center rounded-full bg-primary-foreground", className)}>
        <Wifi className="h-full w-full p-2 text-primary" strokeWidth={1.5} {...props} />
    </div>
  );
}
