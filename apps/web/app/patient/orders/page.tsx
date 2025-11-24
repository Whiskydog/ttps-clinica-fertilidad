"use client";

import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { OrdersPageClient } from '@/components/patient/orders/orders-page-client';
import { getMedicalOrders } from '@/app/actions/patients/medical-orders/get-orders';
import { EmptyState } from '@/components/patient/empty-state';
import type { MedicalOrder } from '@repo/contracts';

export default function OrdersPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["medical-orders"],
    queryFn: () => getMedicalOrders(),
  });

  const orders = (response?.data as MedicalOrder[]) ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando órdenes médicas...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/patient">
            <Button variant="link">← Volver al Dashboard</Button>
          </Link>
        </div>

        <EmptyState
          icon="orders"
          title="No tienes órdenes médicas"
          description="Aún no tienes órdenes médicas registradas. Las órdenes médicas son generadas por tu médico durante el tratamiento."
          showAppointmentButton={true}
          showHomeButton={true}
        />
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

      <OrdersPageClient orders={orders} />
    </div>
  );
}
