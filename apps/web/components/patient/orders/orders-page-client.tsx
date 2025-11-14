'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { OrderFilters } from './order-filters';
import { OrdersList } from './orders-list';

export function OrdersPageClient({ orders }: { orders: any[] }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && order.status === 'pending') ||
      (filter === 'completed' && order.status === 'completed');

    const matchesSearch =
      search === '' ||
      order.code?.toLowerCase().includes(search.toLowerCase()) ||
      order.description?.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <Card>
        <CardHeader className="bg-slate-500">
          <CardTitle className="text-white">ÓRDENES MÉDICAS</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <OrderFilters onFilterChange={setFilter} onSearchChange={setSearch} />
        </CardContent>
      </Card>

      <OrdersList orders={filteredOrders} />
    </>
  );
}
