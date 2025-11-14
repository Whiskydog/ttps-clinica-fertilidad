'use client';

import { TreatmentDetail } from '@repo/contracts';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';

interface MonitoringListProps {
  monitorings: TreatmentDetail["monitorings"] | null;
}

export function MonitoringList({ monitorings }: MonitoringListProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">MONITOREOS REALIZADOS</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-4">
          {monitorings?.map((monitoring) => (
            <div key={monitoring.id} className="border border-gray-300 p-4 rounded-lg">
              <div className="font-bold text-sm mb-2">
                {new Date(monitoring.monitoringDate).toLocaleDateString('es-AR')} - Día {monitoring.dayNumber}
              </div>
              <div className="text-sm space-y-1">
                <p>Folículos {monitoring.follicleSize}: {monitoring.follicleCount}</p>
                <p>
                  E2: {monitoring.estradiolLevel}
                </p>
                <p className="text-xs italic">Observaciones: {monitoring.observations}</p>
              </div>
            </div>
          )) || (
            <p>No se encontraron monitoreos para este tratamiento.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
