"use client";

import { useParams } from 'next/navigation';
import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { Check } from 'lucide-react';
import { getMedicalOrderDetail } from '@/app/actions/patients/medical-orders/get-detail';
import type { MedicalOrderDetail, MedicalOrderStatus } from '@repo/contracts';
import { StudyResultsSection } from '@/components/patient/orders/study-results-section';

export default function OrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["medical-order-detail", id],
    queryFn: () => getMedicalOrderDetail(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando detalle de la orden...</div>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error al cargar la orden médica</div>
      </div>
    );
  }

  const order = response.data as MedicalOrderDetail;

  const statusColors: Record<MedicalOrderStatus, string> = {
    pending: 'bg-amber-600',
    completed: 'bg-green-600',
  };

  return (
    <div className="space-y-6">
      <Link href="/patient/orders">
        <Button variant="link">← Volver a Órdenes</Button>
      </Link>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">ORDEN MÉDICA {order.code}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ESTADO: {order.status?.toUpperCase()}</CardTitle>
            <Badge className={`${statusColors[order.status] || 'bg-gray-600'} text-white`}>
              {order.status?.toUpperCase()}
            </Badge>
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
              {order.doctor && (
                <p>
                  <span className="font-semibold">Médico solicitante:</span> Dr.{' '}
                  {order.doctor.firstName} {order.doctor.lastName}
                </p>
              )}
              {order.treatment && (
                <p>
                  <span className="font-semibold">Tratamiento asociado:</span> #{order.treatment.id}
                </p>
              )}
            </div>
            <div className="space-y-2 text-sm">
              {order.patient && (
                <>
                  <p>
                    <span className="font-semibold">Paciente:</span> {order.patient.firstName}{' '}
                    {order.patient.lastName}
                  </p>
                  <p>
                    <span className="font-semibold">DNI Paciente:</span> {order.patient.dni}
                  </p>
                </>
              )}
              {order.completedDate && (
                <p>
                  <span className="font-semibold">Fecha de completado:</span>{' '}
                  {new Date(order.completedDate).toLocaleDateString('es-AR')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">{order.category || 'ESTUDIOS'}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {order.description && (
            <p className="text-sm mb-4">
              <span className="font-semibold">Descripción:</span> {order.description}
            </p>
          )}

          {order.studies && order.studies.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {order.studies.map((study, index) => (
                <div key={index} className="flex items-center gap-2">
                  {study.checked && <Check className="w-5 h-5 text-green-600" />}
                  <span className="text-sm">{study.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(order.diagnosis || order.justification) && (
        <Card>
          <CardHeader className="bg-slate-500">
            <CardTitle className="text-white">DIAGNÓSTICO / JUSTIFICACIÓN</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border border-black p-4 space-y-2 text-sm">
              {order.diagnosis && <p className="font-semibold">{order.diagnosis}</p>}
              {order.justification && (
                <p className="mt-4">
                  <span className="font-semibold">Justificación:</span> {order.justification}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {order.results && (
        <Card>
          <CardHeader className="bg-slate-500">
            <CardTitle className="text-white">RESULTADOS</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm whitespace-pre-wrap">{order.results}</p>
          </CardContent>
        </Card>
      )}

      {/* Nueva sección de resultados estructurados */}
      <StudyResultsSection studyResults={order.studyResults || []} />
    </div>
  );
}
