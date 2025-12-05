"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { useDoctors } from "@/hooks/doctor/useDoctors";

async function getAllMedicalOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  doctorId?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.status && params.status !== "all")
    searchParams.set("status", params.status);
  if (params.category && params.category !== "all")
    searchParams.set("category", params.category);
  if (params.doctorId && params.doctorId !== "all")
    searchParams.set("doctorId", params.doctorId);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(
    `${backendUrl}/medical-orders?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Error al cargar órdenes médicas");
  }

  const result = await response.json();
  console.log("getAllMedicalOrders raw result:", JSON.stringify(result, null, 2));

  // Manejar respuesta envuelta por interceptor
  // Puede ser: { data: { data: [...], pagination: {...} } } o { data: [...], pagination: {...} }
  const unwrapped = result?.data?.data !== undefined ? result.data : result;
  console.log("getAllMedicalOrders unwrapped:", JSON.stringify(unwrapped, null, 2));

  return {
    data: Array.isArray(unwrapped?.data) ? unwrapped.data : [],
    pagination: unwrapped?.pagination || null,
  };
}

export default function MedicalDirectorOrdersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");

  const { doctors: doctorsData } = useDoctors();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "medical-director",
      "orders",
      page,
      limit,
      statusFilter,
      categoryFilter,
      doctorFilter,
    ],
    queryFn: () =>
      getAllMedicalOrders({
        page,
        limit,
        status: statusFilter,
        category: categoryFilter,
        doctorId: doctorFilter,
      }),
    staleTime: 1000 * 10,
  });

  const orders = response?.data || [];
  const pagination = response?.pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setDoctorFilter("all");
    setPage(1);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">
              Error al cargar órdenes médicas
            </h3>
            <p className="text-sm text-red-700">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-100 rounded-xl">
          <FileText className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">ÓRDENES MÉDICAS</h1>
          <p className="text-muted-foreground">
            Vista completa de todas las órdenes médicas del sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="Estudios Hormonales">
                  Estudios Hormonales
                </SelectItem>
                <SelectItem value="Estudios Ginecológicos">
                  Estudios Ginecológicos
                </SelectItem>
                <SelectItem value="Estudios de Semen">
                  Estudios de Semen
                </SelectItem>
                <SelectItem value="Estudios Prequirúrgicos">
                  Estudios Prequirúrgicos
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los médicos</SelectItem>
                {doctorsData?.map((doctor: any) => (
                  <SelectItem key={doctor.id} value={String(doctor.id)}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {pagination && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm">
              Mostrando <strong>{orders.length}</strong> de{" "}
              <strong>{pagination.total}</strong> órdenes médicas
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Orders Table */}
      {isLoading ? (
        <div className="border rounded-lg p-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-12 bg-muted rounded flex-1"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">
            No hay órdenes médicas
          </h3>
          <p className="text-muted-foreground">
            No se encontraron órdenes con los filtros seleccionados
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      CÓDIGO
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      PACIENTE
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      MÉDICO
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      CATEGORÍA
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      ESTADO
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      FECHA
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr
                      key={order.id}
                      className="border-t hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <span className="font-mono font-medium">
                          {order.code}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {order.patient ? (
                          <div>
                            <span className="font-medium">
                              {order.patient.lastName}, {order.patient.firstName}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              DNI: {order.patient.dni}
                            </p>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {order.doctor ? (
                          <span>
                            Dr. {order.doctor.firstName} {order.doctor.lastName}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm">{order.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className={
                            order.status === "completed"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-yellow-100 text-yellow-800 border-yellow-300"
                          }
                        >
                          {order.status === "completed" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {order.status === "completed"
                            ? "Completada"
                            : "Pendiente"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm">
                          {new Date(order.issueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/medical-director/medical-orders/${order.id}`}
                            >
                              Ver Detalle
                            </Link>
                          </Button>
                          {order.treatment && (
                            <Button asChild size="sm" variant="ghost">
                              <Link
                                href={`/medical-director/treatments/${order.treatment.id}`}
                              >
                                Ver Tratamiento
                              </Link>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
          <div className="text-sm text-muted-foreground">
            Mostrando página{" "}
            <span className="font-semibold">{pagination.page}</span> de{" "}
            <span className="font-semibold">{pagination.totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrev}
              className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum =
                    Math.max(
                      1,
                      Math.min(pagination.totalPages - 4, page - 2)
                    ) + i;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 ${
                        pageNum === page
                          ? "bg-green-600 text-white border-green-600 shadow-md"
                          : "border-border text-foreground bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.hasNext}
              className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
