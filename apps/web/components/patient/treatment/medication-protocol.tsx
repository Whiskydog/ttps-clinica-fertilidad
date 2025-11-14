'use client';

import { TreatmentDetail } from '@repo/contracts';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Check } from 'lucide-react';

interface MedicationProtocolProps {
  protocol: TreatmentDetail["protocol"] | null;
}

export function MedicationProtocol({ protocol }: MedicationProtocolProps) {
  if (!protocol) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">MEDICACIÓN Y PROTOCOLO</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Protocolo de estimulación:</h3>
            <ul className="space-y-1 text-sm" >
              {protocol.medications?.map((medication, index) => (
                <li key={index}>
                  • Droga: {medication.name}
                  <span className="ml-2 text-sm">
                    (Dosis: {medication.dosage}, Frecuencia: {medication.frequency},
                    {medication.duration && `Duración: ${medication.duration}`})
                  </span>
                </li>
              )) || <li>No hay medicamentos programados</li>}
              <li>• Fecha inicio: {protocol.startDate ? new Date(protocol.startDate).toLocaleDateString('es-AR') : '-'}</li>
              <li>• Fecha fin: {protocol.endDate ? new Date(protocol.endDate).toLocaleDateString('es-AR') : '-'}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">Instrucciones adicionales:</h3>
            <p className="text-sm">{protocol.instructions || '-'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
