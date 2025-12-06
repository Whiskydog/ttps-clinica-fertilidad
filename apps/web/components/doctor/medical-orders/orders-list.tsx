"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMedicalOrdersForDoctor } from "@/app/actions/doctor/medical-orders/get-all";
import { Pagination } from "@/components/common/pagination";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { FileText, Calendar, User } from "lucide-react";
import { formatDateForDisplay } from "@/lib/upload-utils";

export function OrdersList() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["doctorMedicalOrders", page],
    queryFn: () => getMedicalOrdersForDoctor(page),
  });

  if (isLoading)
    return (
      <div className="h-40 flex items-center justify-center">Cargando...</div>
    );
  if (error) return <div>Error cargando órdenes</div>;

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* LISTADO */}
      {orders.map((order: any) => (
        <div
          key={order.id}
          className="border rounded-lg p-4 flex justify-between items-center hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>

            <div>
              <p className="font-semibold">Orden #{order.code}</p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <User className="h-4 w-4" />
                {order.patient?.firstName} {order.patient?.lastName}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDateForDisplay(order.issueDate)}
              </div>

              <Badge variant="outline">
                {order.status === "completed" ? "Completada" : "Pendiente"}
              </Badge>
            </div>
          </div>

          <Link href={`/doctor/medical-orders/${order.id}`}>
            <Button variant="outline">Ver detalle</Button>
          </Link>
        </div>
      ))}

      {/* PAGINACIÓN */}
      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
