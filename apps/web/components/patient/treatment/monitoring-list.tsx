'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';

interface Monitoring {
  id: number;
  date: string;
  day: number;
  follicles: string;
  follicleSize: string;
  estradiol: number;
  unit: string;
  observations: string;
}

interface MonitoringListProps {
  monitorings: Monitoring[];
}

export function MonitoringList({ monitorings }: MonitoringListProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">MONITOREOS REALIZADOS</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-4">
          {monitorings.map((monitoring) => (
            <div key={monitoring.id} className="border border-gray-300 p-4 rounded-lg">
              <div className="font-bold text-sm mb-2">
                {new Date(monitoring.date).toLocaleDateString('es-AR')} - Día {monitoring.day}
              </div>
              <div className="text-sm space-y-1">
                <p>Folículos {monitoring.follicleSize}: {monitoring.follicles}</p>
                <p>
                  E2: {monitoring.estradiol} {monitoring.unit}
                </p>
                <p className="text-xs italic">Observaciones: {monitoring.observations}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
