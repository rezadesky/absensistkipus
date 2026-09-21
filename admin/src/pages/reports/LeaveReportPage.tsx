import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { leaveApi } from '@/api/leave';
import type { LeaveRequestItem } from '@/types';
import { Printer, Calendar, Loader2 } from 'lucide-react';

export const LeaveReportPage: React.FC = () => {
  const [items, setItems] = useState<LeaveRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await leaveApi.getLeaveRequests({ per_page: 50 });
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
          title="Laporan Izin"
          subtitle="Cetak dan ekspor rekapitulasi pengajuan izin pegawai STKIP Usman Safri."
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
              Laporan Pengajuan Izin & Cuti
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
                <TableHead className="w-[25%]">Nama Pegawai</TableHead>
                <TableHead className="w-[15%]">Jenis Izin</TableHead>
                <TableHead className="w-[20%]">Tanggal Izin</TableHead>
                <TableHead className="w-[25%]">Alasan</TableHead>
                <TableHead className="w-[15%] text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
                    <span>Memuat laporan izin...</span>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-xs text-muted-foreground">
                    Belum ada data pengajuan izin.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-semibold text-secondary text-xs sm:text-sm">
                        {item.user?.name || '-'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.user?.role} - {item.user?.employee?.department || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-xs font-medium">
                      {item.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.start_date} s/d {item.end_date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {item.reason}
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
