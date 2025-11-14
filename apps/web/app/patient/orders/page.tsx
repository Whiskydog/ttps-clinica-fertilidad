"use client";

import { useQuery } from "@tanstack/react-query";
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { OrdersPageClient } from '@/components/patient/orders/orders-page-client';
import { getMedicalOrders } from '@/app/actions/patients/medical-orders/get-orders';
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
        <div className="text-lg">Cargando órdenes médicas...</div>
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
