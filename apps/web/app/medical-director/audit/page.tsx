"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  User,
  Database,
  Eye,
  Filter,
} from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";

interface AuditLog {
  id: number;
  tableName: string;
  recordId: string;
  modifiedField: string;
  oldValue: any;
  newValue: any;
  modificationTimestamp: string;
  modifiedByUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface AuditUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  userId?: string;
  tableName?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.userId && params.userId !== "all")
    searchParams.set("userId", params.userId);
  if (params.tableName && params.tableName !== "all")
    searchParams.set("tableName", params.tableName);
  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.set("dateTo", params.dateTo);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(
    `${backendUrl}/audit?${searchParams.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Error al cargar logs de auditoría");
  }

  const result = await response.json();
  console.log("getAuditLogs raw result:", JSON.stringify(result, null, 2));

  // Manejar respuesta envuelta por interceptor
  // Puede ser: { data: { data: [...], pagination: {...} } } o { data: [...], pagination: {...} }
  const unwrapped = result?.data?.data !== undefined ? result.data : result;
  console.log("getAuditLogs unwrapped:", JSON.stringify(unwrapped, null, 2));

  return {
    data: Array.isArray(unwrapped?.data) ? unwrapped.data : [],
    pagination: unwrapped?.pagination || null,
  };
}

async function getAuditTables(): Promise<string[]> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${backendUrl}/audit/tables`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al cargar tablas");
  }

  const result = await response.json();
  console.log("getAuditTables raw result:", result);
  console.log("getAuditTables result.data:", result?.data);
  // Manejar respuesta envuelta por interceptor: { data: { data: [...] } } o { data: [...] }
  const data = result?.data?.data ?? result?.data ?? result;
  console.log("getAuditTables final data:", data);
  return Array.isArray(data) ? data : [];
}

async function getAuditUsers(): Promise<AuditUser[]> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${backendUrl}/audit/users`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al cargar usuarios");
  }

  const result = await response.json();
  console.log("getAuditUsers raw result:", result);
  console.log("getAuditUsers result.data:", result?.data);
  const data = result?.data?.data ?? result?.data ?? result;
  console.log("getAuditUsers final data:", data);
  return Array.isArray(data) ? data : [];
}

export default function MedicalDirectorAuditPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [userFilter, setUserFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Fetch tables and users for filters
  const { data: tables = [] } = useQuery<string[]>({
    queryKey: ["audit", "tables"],
    queryFn: getAuditTables,
    staleTime: 1000 * 60 * 5,
  });

  const { data: users = [] } = useQuery<AuditUser[]>({
    queryKey: ["audit", "users"],
    queryFn: getAuditUsers,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "audit",
      "logs",
      page,
      limit,
      userFilter,
      tableFilter,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      getAuditLogs({
        page,
        limit,
        userId: userFilter,
        tableName: tableFilter,
        dateFrom,
        dateTo,
      }),
    staleTime: 1000 * 10,
  });

  const logs: AuditLog[] = response?.data || [];
  const pagination = response?.pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleClearFilters = () => {
    setUserFilter("all");
    setTableFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailSheetOpen(true);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const getTableDisplayName = (tableName: string): string => {
    const tableNames: Record<string, string> = {
      treatment: "Tratamiento",
      patient: "Paciente",
      medical_order: "Orden Médica",
      doctor_note: "Nota de Doctor",
      medication_protocol: "Protocolo de Medicación",
      monitoring: "Monitoreo",
      informed_consent: "Consentimiento",
      background: "Antecedente",
      habits: "Hábitos",
      fenotype: "Fenotipo",
      oocyte: "Ovocito",
      embryo: "Embrión",
      study_result: "Resultado de Estudio",
    };
    return tableNames[tableName] || tableName;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">
              Error al cargar auditoría
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
        <div className="p-3 bg-purple-100 rounded-xl">
          <Shield className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">PANEL DE AUDITORÍA</h1>
          <p className="text-muted-foreground">
            Registro completo de modificaciones en el sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pagination?.total || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tablas Auditadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuarios Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={String(user.id)}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tabla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tablas</SelectItem>
                {tables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {getTableDisplayName(table)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[150px]"
                placeholder="Desde"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[150px]"
                placeholder="Hasta"
              />
            </div>

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
            <Shield className="h-5 w-5 text-purple-600" />
            <span className="text-sm">
              Mostrando <strong>{logs.length}</strong> de{" "}
              <strong>{pagination.total}</strong> registros de auditoría
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      {isLoading ? (
        <div className="border rounded-lg p-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-12 bg-muted rounded flex-1"></div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">
            No hay registros de auditoría
          </h3>
          <p className="text-muted-foreground">
            No se encontraron registros con los filtros seleccionados
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
                      FECHA/HORA
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      USUARIO
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      TABLA
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      REGISTRO
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      CAMPO MODIFICADO
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <span className="font-medium">
                            {new Date(
                              log.modificationTimestamp
                            ).toLocaleDateString()}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              log.modificationTimestamp
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {log.modifiedByUser ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <span className="font-medium">
                                {log.modifiedByUser.firstName}{" "}
                                {log.modifiedByUser.lastName}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {log.modifiedByUser.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Usuario desconocido
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className="font-mono text-xs">
                          <Database className="h-3 w-3 mr-1" />
                          {getTableDisplayName(log.tableName)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm">
                          #{log.recordId}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm">{log.modifiedField}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetail(log)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalle
                        </Button>
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
                          ? "bg-purple-600 text-white border-purple-600 shadow-md"
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

      {/* Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalle del Registro de Auditoría</SheetTitle>
            <SheetDescription>
              Información completa de la modificación
            </SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="space-y-6 mt-6">
              {/* Metadata */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Fecha y Hora
                  </label>
                  <p className="mt-1 font-medium">
                    {new Date(
                      selectedLog.modificationTimestamp
                    ).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Usuario que realizó el cambio
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">
                      {selectedLog.modifiedByUser?.firstName}{" "}
                      {selectedLog.modifiedByUser?.lastName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({selectedLog.modifiedByUser?.email})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tabla
                    </label>
                    <p className="mt-1">
                      <Badge variant="outline" className="font-mono">
                        {getTableDisplayName(selectedLog.tableName)}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      ID del Registro
                    </label>
                    <p className="mt-1 font-mono">#{selectedLog.recordId}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Campo Modificado
                  </label>
                  <p className="mt-1 font-medium">{selectedLog.modifiedField}</p>
                </div>
              </div>

              {/* Value Comparison */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-semibold">Comparación de Valores</h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-red-600">
                      Valor Anterior
                    </label>
                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap break-words font-mono text-red-800">
                        {formatValue(selectedLog.oldValue)}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-green-600">
                      Valor Nuevo
                    </label>
                    <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap break-words font-mono text-green-800">
                        {formatValue(selectedLog.newValue)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
