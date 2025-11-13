'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Check } from 'lucide-react';

interface Protocol {
  type: string;
  drug: string;
  dose: string;
  via: string;
  duration: string;
  startDate: string;
  additionalMedication: string[];
  consentSigned: boolean;
  consentDate: string;
}

interface MedicationProtocolProps {
  protocol: Protocol;
}

export function MedicationProtocol({ protocol }: MedicationProtocolProps) {
  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <CardTitle className="text-white">MEDICACIÓN Y PROTOCOLO</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Protocolo de estimulación:</h3>
            <ul className="space-y-1 text-sm">
              <li>• Tipo: {protocol.type}</li>
              <li>• Droga: {protocol.drug}</li>
              <li>• Dosis: {protocol.dose}</li>
              <li>• Vía: {protocol.via}</li>
              <li>• Duración estimada: {protocol.duration}</li>
              <li>• Fecha inicio: {new Date(protocol.startDate).toLocaleDateString('es-AR')}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">Medicación adicional:</h3>
            <ul className="space-y-1 text-sm">
              {protocol.additionalMedication.map((med, index) => (
                <li key={index}>• {med}</li>
              ))}
            </ul>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-semibold">Consentimiento informado:</span>
              {protocol.consentSigned && (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">
                    Firmado {new Date(protocol.consentDate).toLocaleDateString('es-AR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
