"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPatients } from "@/app/actions/doctor/patients/get";
import { PatientsPaginatedResponse } from "@repo/contracts";
import {
  Search,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  AlertCircle,
} from "lucide-react";

export default function DoctorPatientsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dniSearch, setDniSearch] = useState("");

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
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (error)
    return (
      <div className="page-container">
        <div className="error-message fade-in">
          <AlertCircle className="error-icon h-5 w-5" />
          <div>
            <h3 className="font-semibold">Error al cargar pacientes</h3>
            <p className="text-sm mt-1">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Pacientes
            </h1>
            <p className="text-muted-foreground">
              Gestiona y visualiza la información de los pacientes
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-heading-3">Buscar y filtrar pacientes</h2>
          <p className="text-small">
            Utiliza los controles para encontrar pacientes específicos
          </p>
        </div>
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="dni-search" className="form-label">
                Buscar por DNI
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  id="dni-search"
                  type="text"
                  value={dniSearch}
                  onChange={(e) => setDniSearch(e.target.value)}
                  placeholder="Ingrese DNI..."
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="limit-select" className="form-label">
                Pacientes por página
              </label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="form-input"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button onClick={handleSearch} className="btn-primary">
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {pagination && (
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 px-6 py-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div className="text-sm">
                Mostrando{" "}
                <span className="font-bold text-primary">
                  {patients.length}
                </span>{" "}
                de{" "}
                <span className="font-bold text-primary">
                  {pagination.total}
                </span>{" "}
                pacientes
                {dniSearch && (
                  <span className="ml-2 text-muted-foreground">
                    (filtrado por DNI:{" "}
                    <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                      {dniSearch}
                    </span>
                    )
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
              Página {pagination.page} de {pagination.totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Patients Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 animate-pulse"
              >
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-48"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
                <div className="h-8 w-24 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-16 px-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {dniSearch
                ? "No se encontraron pacientes"
                : "No hay pacientes registrados"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {dniSearch
                ? "No encontramos pacientes que coincidan con el DNI especificado."
                : ""}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b-2 border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {patients.map(({ id, firstName, lastName, dni }) => (
                  <tr key={id} className="table-row group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          {firstName.charAt(0)}
                          {lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {firstName} {lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Paciente registrado
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm bg-muted px-3 py-1 rounded-md border">
                        {dni}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link
                          href={`/doctor/patients/${id}`}
                          className="btn-secondary text-sm inline-flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                        >
                          <FileText className="h-4 w-4" />
                          Ver HC
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
