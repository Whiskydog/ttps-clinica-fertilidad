'use client';

import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import Link from 'next/link';

interface Treatment {
  id: number;
  code: string;
  status: string;
  type: string;
  doctor: {
    firstName: string;
    lastName: string;
  };
  period: string;
}

interface TreatmentHistoryProps {
  treatments: Treatment[];
}

export function TreatmentHistory({ treatments }: TreatmentHistoryProps) {
  if (treatments.length === 0) {
    return null;
  }

  return (
    <Card className="bg-purple-200 border-none">
      <CardHeader>
        <CardTitle>Historial Tratamientos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {treatments.map((treatment) => (
            <div
              key={treatment.id}
              className="bg-black text-white p-4 rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="font-semibold">
                  Tratamiento #{treatment.id} - {treatment.status.toUpperCase()}
                </p>
                <p className="text-sm">Tipo: {treatment.type}</p>
                <p className="text-sm">
                  Médico: Dr. {treatment.doctor.firstName} {treatment.doctor.lastName}
                </p>
                <p className="text-sm">Período: {treatment.period}</p>
              </div>
              <Link href={`/patient/treatment/${treatment.id}`}>
                <Button variant="secondary" size="sm">
                  Ver Detalles
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
