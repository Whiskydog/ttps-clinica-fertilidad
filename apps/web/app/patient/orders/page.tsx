'use client';

import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { OrderFilters } from '@/components/patient/orders/order-filters';
import { OrdersList } from '@/components/patient/orders/orders-list';
import { mockMedicalOrders } from '../lib/mock-data';
import { useState } from 'react';

export default function OrdersPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredOrders = mockMedicalOrders.filter((order) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && order.status === 'pending') ||
      (filter === 'completed' && order.status === 'completed');

    const matchesSearch =
      search === '' ||
      order.code.toLowerCase().includes(search.toLowerCase()) ||
      order.description.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patient">
          <Button variant="outline">← Volver al Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">ÓRDENES MÉDICAS</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <OrderFilters onFilterChange={setFilter} onSearchChange={setSearch} />
        </CardContent>
      </Card>

      <OrdersList orders={filteredOrders} />
    </div>
  );
}
