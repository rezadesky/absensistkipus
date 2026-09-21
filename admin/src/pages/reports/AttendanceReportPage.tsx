import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { attendanceApi } from '@/api/attendance';
import type { AttendanceItem } from '@/types';
import { Printer, Calendar, Loader2 } from 'lucide-react';

export const AttendanceReportPage: React.FC = () => {
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await attendanceApi.getHistory({ per_page: 50 });
        if (res.success && res.data) {
          setItems(res.data.items);
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 print:p-0">
      <div className="print:hidden">
        <PageHeader
          title="Laporan Absensi"
          subtitle="Cetak dan ekspor rekapitulasi kehadiran pegawai STKIP Usman Safri."
        >
          <Button onClick={handlePrint} className="bg-primary hover:bg-orange-600 text-white gap-2 text-xs h-9 cursor-pointer">
            <Printer className="h-4 w-4" />
            <span>Cetak / Simpan PDF</span>
          </Button>
        </PageHeader>
      </div>

      <Card className="border border-border shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b">
          <div className="text-center sm:text-left">
            <CardTitle className="text-lg font-bold text-secondary uppercase">
              Laporan Kehadiran Pegawai
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              STKIP Usman Safri — Sistem Absensi Fungsional Dosen & Tendik
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[15%]">Tanggal</TableHead>
                <TableHead className="w-[30%]">Nama Pegawai</TableHead>
                <TableHead className="w-[20%]">Unit & Role</TableHead>
                <TableHead className="w-[15%]">Waktu Masuk</TableHead>
                <TableHead className="w-[20%] text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
                    <span>Memuat laporan...</span>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-xs text-muted-foreground">
                    Belum ada data laporan.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.attendance_date}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-secondary text-xs sm:text-sm">
                        {item.user ? (item.user as any).name : item.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.user && (item.user as any).employee?.employee_number ? `NIP. ${(item.user as any).employee.employee_number}` : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.user ? (item.user as any).role : item.role} - {item.user && (item.user as any).employee?.department ? (item.user as any).employee.department : item.unit}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-emerald-700">
                      {item.check_in_time || item.checkInTime || '-'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <StatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
