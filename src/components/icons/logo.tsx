import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';

export function ConnectUgLogo({ className, ...props }: LucideProps) {
  return (
    <div className={cn("flex items-center justify-center rounded-full bg-primary-foreground", className)}>
        <MessageCircle className="h-full w-full p-2 text-primary" strokeWidth={1.5} {...props} />
    </div>
  );
}
