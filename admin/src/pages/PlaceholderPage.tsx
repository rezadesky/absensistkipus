import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  category?: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  category = 'Modul',
  description = 'Halaman modul ini disiapkan untuk integrasi data pada tahap pengembangan selanjutnya.',
}) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={`${category} — Sistem Absensi STKIP Usman Safri`}
      />

      <Card className="border border-border">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <Construction className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-secondary">
            Modul {title} Siap Dikonfigurasi
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1.5">
            {description}
          </p>
          <div className="mt-6 flex gap-2 text-xs font-mono bg-muted px-3 py-1.5 rounded-md text-muted-foreground">
            Status: Foundation Ready (Mock Stage)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
