'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';

interface ProductsSummaryProps {
  summary: {
    ovules: {
      total: number;
      cryoDate: string;
    };
    embryos: {
      total: number;
      lastUpdate: string;
    };
  };
}

export function ProductsSummary({ summary }: ProductsSummaryProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white text-center">RESUMEN</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-green-500 rounded-lg p-6 text-center">
            <div className="text-green-500 font-bold text-sm mb-2">ÓVULOS</div>
            <div className="text-green-500 text-4xl font-bold mb-2">
              Total: {summary.ovules.total}
            </div>
            <div className="text-sm text-gray-600">
              Fecha congelación: {new Date(summary.ovules.cryoDate).toLocaleDateString('es-AR')}
            </div>
          </div>

          <div className="border-2 border-blue-500 rounded-lg p-6 text-center">
            <div className="text-blue-500 font-bold text-sm mb-2">EMBRIONES</div>
            <div className="text-blue-500 text-4xl font-bold mb-2">
              Total: {summary.embryos.total}
            </div>
            <div className="text-sm text-gray-600">
              Última actualización:{' '}
              {new Date(summary.embryos.lastUpdate).toLocaleDateString('es-AR')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
