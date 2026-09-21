import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  iconColorClass?: string;
  iconBgClass?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  description,
  badge,
  iconColorClass = 'text-primary',
  iconBgClass = 'bg-primary/10',
  className,
}) => {
  return (
    <Card className={cn('hover:shadow-md transition-shadow duration-200 border-border', className)}>
      <CardContent className="p-3.5 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{label}</p>
          <div className={`p-1.5 sm:p-2 rounded-lg ${iconBgClass} shrink-0`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColorClass}`} />
          </div>
        </div>
        <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-secondary">
            {value}
          </span>
          {badge && (
            <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-muted-foreground truncate">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
