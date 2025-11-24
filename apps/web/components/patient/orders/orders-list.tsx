'use client';

import { Button } from '@repo/ui/button';
import { Card, CardContent } from '@repo/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: number;
  code: string;
  status: string;
  issueDate: string;
  completedDate?: string;
  doctor: {
    firstName: string;
    lastName: string;
  };
  category?: string;
  description: string;
}

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders }: OrdersListProps) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card
          key={order.id}
          className={`${
            order.status === 'pending'
              ? 'bg-amber-700 text-white'
              : 'bg-purple-200 text-black'
          } border-none`}
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {order.status === 'pending' ? (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1" />
                ) : (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-1 text-green-600" />
                )}
                <div className="space-y-1">
                  <p className="font-bold text-lg">
                    {order.status === 'pending' ? '⚠ PENDIENTE' : '✓ COMPLETADA'}
                  </p>
                  <p className="font-semibold">Orden {order.code}</p>
                  <p className="text-sm">
                    Fecha emisión:{' '}
                    {new Date(order.issueDate).toLocaleDateString('es-AR')}
                  </p>
                  {order.completedDate && (
                    <p className="text-sm">
                      Completada:{' '}
                      {new Date(order.completedDate).toLocaleDateString('es-AR')}
                    </p>
                  )}
                  <p className="text-sm">
                    Médico: Dr. {order.doctor.firstName} {order.doctor.lastName}
                  </p>
                  <p className="text-sm">{order.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/patient/orders/${order.id}`}>
                  <Button
                    size="sm"
                    variant={order.status === 'pending' ? 'secondary' : 'default'}
                  >
                    Ver Detalles
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant={order.status === 'pending' ? 'outline' : 'secondary'}
                  className={order.status === 'pending' ? 'bg-rose-300 text-black border-none' : ''}
                >
                  {order.status === 'completed' ? 'Ver Resultados' : 'Descargar PDF'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
