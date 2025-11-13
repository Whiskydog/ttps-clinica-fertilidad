import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { Check } from 'lucide-react';
import { mockOrderDetail } from '../../lib/mock-data';

export default function OrderDetailPage() {
  const order = mockOrderDetail;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patient/orders">
          <Button variant="outline">← Volver a Órdenes</Button>
        </Link>
        <h1 className="text-2xl font-bold">ORDEN MÉDICA {order.code}</h1>
        <Button variant="secondary" className="ml-auto bg-rose-300 text-black">
          Descargar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ESTADO: PENDIENTE</CardTitle>
            <Badge className="bg-amber-600 text-white">PENDIENTE</Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">INFORMACIÓN DE LA ORDEN</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Fecha de emisión:</span>{' '}
                {new Date(order.issueDate).toLocaleDateString('es-AR')}
              </p>
              <p>
                <span className="font-semibold">Médico solicitante:</span> Dr.{' '}
                {order.doctor.firstName} {order.doctor.lastName}
              </p>
              <p>
                <span className="font-semibold">Matrícula:</span> MN 45678
              </p>
              <p>
                <span className="font-semibold">Tratamiento asociado:</span> {order.treatment.code}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Paciente:</span> {order.patient.firstName}{' '}
                {order.patient.lastName}
              </p>
              <p>
                <span className="font-semibold">DNI Paciente:</span> {order.patient.dni}
              </p>
              <p>
                <span className="font-semibold">Obra Social:</span> {order.medicalInsurance.name}
              </p>
              <p>
                <span className="font-semibold">Nro. Afiliado:</span>{' '}
                {order.medicalInsurance.memberId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">{order.category}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {order.studies.map((study, index) => (
              <div key={index} className="flex items-center gap-2">
                {study.checked && <Check className="w-5 h-5 text-green-600" />}
                <span className="text-sm">{study.name}</span>
              </div>
            ))}
          </div>

          {order.specialInstructions && order.specialInstructions.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="font-semibold text-sm mb-2">Indicaciones especiales:</p>
              <ul className="space-y-1">
                {order.specialInstructions.map((instruction, index) => (
                  <li key={index} className="text-sm">
                    • {instruction}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">DIAGNÓSTICO / JUSTIFICACIÓN</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="border border-black p-4 space-y-2 text-sm">
            <p className="font-semibold">{order.diagnosis.code}</p>
            <p className="font-semibold">{order.diagnosis.description}</p>
            <p className="mt-4">
              <span className="font-semibold">Justificación:</span> {order.justification}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">LABORATORIOS HABILITADOS</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm mb-4">
            Esta orden puede ser utilizada en los siguientes laboratorios de la red:
          </p>
          <ul className="space-y-2">
            {order.laboratories.map((lab, index) => (
              <li key={index} className="text-sm">
                • <span className="font-semibold">{lab.name}</span> - {lab.address}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-center">
            <div className="bg-white p-4 border border-gray-300 rounded inline-block">
              <p className="text-center text-xs mb-2">QR Code para validación</p>
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                [QR: {order.qrCode}]
              </div>
              <p className="text-center text-xs mt-2">Código: {order.qrCode}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
