import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { AttendanceItem } from '@/types';
import { Clock, User, Building, Loader2 } from 'lucide-react';

interface AttendanceTableProps {
  data: AttendanceItem[];
  isLoading?: boolean;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ data, isLoading }) => {
  return (
    <Card className="border border-border shadow-sm overflow-hidden bg-white">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-secondary">
              Absensi Hari Ini
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Daftar kehadiran dosen dan tendik real-time dari sistem.
            </CardDescription>
          </div>
          <div className="self-start sm:self-auto text-xs text-muted-foreground font-medium bg-muted/70 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md">
            Total: <strong className="text-secondary">{data.length} Pegawai</strong>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* DESKTOP & TABLET VIEW: Full Table */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">Nama & NIP</TableHead>
                <TableHead className="w-[15%]">Role</TableHead>
                <TableHead className="w-[22%]">Unit Kerja</TableHead>
                <TableHead className="w-[14%]">Jam Masuk</TableHead>
                <TableHead className="w-[14%] text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span>Memuat data absensi...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs">
                    Tidak ada data absensi yang sesuai dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => {
                  const checkInDisplay = item.check_in || item.checkInTime || item.check_in_time;
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-xs shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-secondary text-xs sm:text-sm truncate">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              NIP. {item.nip}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            item.role?.toLowerCase() === 'dosen'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {item.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-foreground/80">
                        {item.unit}
                      </TableCell>
                      <TableCell className="text-xs">
                        {checkInDisplay ? (
                          <span className="flex items-center gap-1.5 text-foreground/90 font-mono text-xs font-medium">
                            <Clock className="h-3.5 w-3.5 text-emerald-600" />
                            {checkInDisplay}
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-mono text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <StatusBadge status={item.status} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* MOBILE VIEW: Touch-Friendly Card List */}
        <div className="block sm:hidden divide-y divide-border/60">
          {isLoading ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Memuat data absensi...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs">
              Tidak ada data absensi yang sesuai filter.
            </div>
          ) : (
            data.map((item) => {
              const checkInDisplay = item.check_in || item.checkInTime || item.check_in_time;
              return (
                <div key={item.id} className="p-3.5 space-y-2 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-secondary text-xs sm:text-sm leading-tight truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          NIP. {item.nip}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                          item.role?.toLowerCase() === 'dosen'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {item.role}
                      </span>
                      <span className="flex items-center gap-1 truncate text-foreground/80 text-[11px]">
                        <Building className="h-3 w-3 text-muted-foreground shrink-0" />
                        {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-foreground/90 font-mono text-[11px] font-medium ml-auto">
                      <Clock className="h-3 w-3 text-emerald-600" />
                      {checkInDisplay || '-'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Menampilkan <strong>{data.length}</strong> pegawai</span>
        </div>
      </CardContent>
    </Card>
  );
};
