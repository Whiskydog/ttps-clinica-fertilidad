"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPatients } from "@/app/actions/doctor/patients/get";
import { PatientsPaginatedResponse } from "@repo/contracts";
import { Users, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { PatientFilters } from "@/components/doctor/patients/patient-filters";
import { Card, CardContent } from "@repo/ui/card";
import Link from "next/link";
import { Button } from "@repo/ui/button";

export default function MedicalDirectorPatientsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dniSearch, setDniSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">(
    "all"
  );

  const {
    data: response,
    isLoading,
    error,
  } = useQuery<PatientsPaginatedResponse>({
    queryKey: ["medical-director", "patients", page, limit, dniSearch],
    queryFn: async () => {
      const payload = await getPatients({
        page,
        limit,
        dni: dniSearch || undefined,
      });
      return payload;
    },
    staleTime: 1000 * 10,
  });

  const patients = response?.data || [];
  const pagination = response?.pagination;

  const handleSearch = () => {
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Calcular la edad desde la fecha de nacimiento
  const calculateAge = (dateOfBirth: string | null | undefined) => {
    if (!dateOfBirth) return "-";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">
              Error al cargar pacientes
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
        <div className="p-3 bg-blue-100 rounded-xl">
          <Users className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">TODOS LOS PACIENTES</h1>
          <p className="text-muted-foreground">
            Vista completa de todos los pacientes del sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Lista de pacientes */}
        <div className="space-y-6">
          {/* Filtros y búsqueda */}
          <PatientFilters
            dniSearch={dniSearch}
            setDniSearch={setDniSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onSearch={handleSearch}
          />

          {/* Resumen de resultados */}
          {pagination && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm">
                  Mostrando <strong>{patients.length}</strong> de{" "}
                  <strong>{pagination.total}</strong> pacientes
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </div>
            </div>
          )}

          {/* Tabla de pacientes */}
          {isLoading ? (
            <div className="border rounded-lg p-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-12 bg-muted rounded flex-1"></div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          PACIENTE
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          DNI
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          EDAD
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          OBRA SOCIAL
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">
                          ACCIONES
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient: any) => (
                        <tr
                          key={patient.id}
                          className="border-t hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <span className="font-medium">
                              {patient.lastName}, {patient.firstName}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm">
                              {patient.dni}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {calculateAge(patient.dateOfBirth)} años
                          </td>
                          <td className="px-4 py-4">
                            {patient.medicalInsuranceName || "-"}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button asChild size="sm" variant="outline">
                                <Link
                                  href={`/medical-director/patients/${patient.id}`}
                                >
                                  Ver
                                </Link>
                              </Button>
                              <Button asChild size="sm" variant="default">
                                <Link
                                  href={`/medical-director/patients/${patient.id}/medical-history`}
                                >
                                  Historia Clínica
                                </Link>
                              </Button>
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
        </div>
      </div>

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
                    Math.max(1, Math.min(pagination.totalPages - 4, page - 2)) +
                    i;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 ${
                        pageNum === page
                          ? "bg-blue-600 text-white border-blue-600 shadow-md"
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
