import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, CalendarCheck, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
      <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-sm h-8 sm:h-9 text-xs justify-center">
        <Link to="/master/dosen">
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          <span>+ Dosen</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="border-border h-8 sm:h-9 text-xs justify-center">
        <Link to="/master/tendik">
          <Users className="mr-1.5 h-3.5 w-3.5 text-secondary" />
          <span>+ Tendik</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="border-border h-8 sm:h-9 text-xs justify-center">
        <Link to="/attendance/today">
          <CalendarCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
          <span>Absensi</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="border-border h-8 sm:h-9 text-xs justify-center">
        <Link to="/leave">
          <FileCheck className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
          <span>Verifikasi</span>
        </Link>
      </Button>
    </div>
  );
};
