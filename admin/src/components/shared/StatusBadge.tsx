import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { AttendanceStatus } from '@/types';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AttendanceStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'hadir':
      return (
        <Badge variant="success" className="gap-1 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Hadir
        </Badge>
      );
    case 'izin':
      return (
        <Badge variant="warning" className="gap-1 font-medium">
          <Clock className="h-3.5 w-3.5" />
          Izin
        </Badge>
      );
    case 'belum_absen':
      return (
        <Badge variant="muted" className="gap-1 font-medium">
          <AlertCircle className="h-3.5 w-3.5" />
          Belum Absen
        </Badge>
      );
    case 'menunggu':
      return (
        <Badge variant="warning" className="gap-1 font-medium">
          <Clock className="h-3.5 w-3.5" />
          Menunggu
        </Badge>
      );
    case 'ditolak':
    case 'tidak_hadir':
      return (
        <Badge variant="destructive" className="gap-1 font-medium">
          <XCircle className="h-3.5 w-3.5" />
          {status === 'ditolak' ? 'Ditolak' : 'Tidak Hadir'}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
