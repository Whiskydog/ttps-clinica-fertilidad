'use client';

import { TreatmentDetail } from '@repo/contracts';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Download, FileText } from 'lucide-react';
import { getFileUrl } from '@/lib/upload-utils';

interface MedicationProtocolProps {
  protocol: TreatmentDetail["protocol"] | null;
}

export function MedicationProtocol({ protocol }: MedicationProtocolProps) {
  if (!protocol) {
    return null;
  }

  const handleDownloadPdf = () => {
    if (protocol.pdfUrl) {
      const url = getFileUrl(protocol.pdfUrl);
      if (url) window.open(url, "_blank");
    }
  };

  return (
    <Card>
      <CardHeader className="bg-slate-500">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">MEDICACIÓN Y PROTOCOLO</CardTitle>
          {protocol.pdfUrl && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownloadPdf}
              className="bg-white hover:bg-gray-100 text-slate-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Receta
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold mb-3">Protocolo de estimulación:</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-medium">Tipo de protocolo:</span>{' '}
                {protocol.protocolType || '-'}
              </li>
              <li>
                <span className="font-medium">Medicamento principal:</span>{' '}
                {protocol.drugName || '-'}
              </li>
              <li>
                <span className="font-medium">Dosis:</span>{' '}
                {protocol.dose || '-'}
              </li>
              <li>
                <span className="font-medium">Vía de administración:</span>{' '}
                {protocol.administrationRoute || '-'}
              </li>
              {protocol.duration && (
                <li>
                  <span className="font-medium">Duración:</span>{' '}
                  {protocol.duration}
                </li>
              )}
              <li>
                <span className="font-medium">Fecha de inicio:</span>{' '}
                {protocol.startDate
                  ? new Date(protocol.startDate).toLocaleDateString('es-AR')
                  : '-'}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">Medicación adicional:</h3>
            {protocol.additionalMedication && protocol.additionalMedication.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {protocol.additionalMedication.map((med, index) => (
                  <li key={index}>• {med}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay medicación adicional indicada
              </p>
            )}

            {/* Indicador de PDF disponible */}
            {protocol.pdfUrl && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Receta disponible para descargar
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Puede presentar este documento en la farmacia
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
