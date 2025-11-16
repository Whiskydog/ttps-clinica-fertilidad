"use client";

import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent } from '@repo/ui/card';
import { AlertTriangle } from 'lucide-react';
import { ProductsSummary } from '@/components/patient/cryopreserved/products-summary';
import { OvulesList } from '@/components/patient/cryopreserved/ovules-list';
import { EmbryosList } from '@/components/patient/cryopreserved/embryos-list';
import { getCryopreservationSummary } from '@/app/actions/patients/cryopreservation/get-summary';
import type { CryopreservationSummary } from '@repo/contracts';

export default function CryopreservedPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["cryopreservation-summary"],
    queryFn: () => getCryopreservationSummary(),
  });

  const defaultData: CryopreservationSummary = {
    summary: {
      ovules: {
        total: 0,
        cryoDate: new Date(),
      },
      embryos: {
        total: 0,
        lastUpdate: new Date(),
      },
    },
    ovules: [],
    embryos: []
  };

  

  const cryoData = (response?.data as CryopreservationSummary | null) ?? defaultData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando productos criopreservados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patient">
          <Button variant="link">← Volver al Dashboard</Button>
        </Link>
      </div>

      <ProductsSummary summary={cryoData.summary} />

      <OvulesList ovules={cryoData.ovules?? []} />

      <EmbryosList embryos={cryoData.embryos?? []  } />

      <Card className="bg-amber-100 border-amber-300">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Nota:</span> Cualquier acción sobre productos
              criopreservados requiere autorización médica
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
