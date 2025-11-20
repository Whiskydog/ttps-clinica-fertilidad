"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPatients } from "@/app/actions/doctor/patients/get";
import { PatientsPaginatedResponse } from "@repo/contracts";
import { Users, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { PatientFilters } from "@/components/doctor/patients/patient-filters";
import { PatientsTable } from "@/components/doctor/patients/patients-table";

export default function DoctorPatientsPage() {
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
    queryKey: ["doctor", "patients", page, limit, dniSearch],
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
        <div className="p-3 bg-primary/10 rounded-xl">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">MIS PACIENTES</h1>
          <p className="text-muted-foreground">
            Gestiona y visualiza la información de tus pacientes
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
                <Users className="h-5 w-5 text-primary" />
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
            <PatientsTable patients={patients} />
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
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
                          ? "bg-primary text-primary-foreground border-primary shadow-md"
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
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
