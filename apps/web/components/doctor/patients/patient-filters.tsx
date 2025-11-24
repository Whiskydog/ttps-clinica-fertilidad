import { Search } from "lucide-react";
import { Button } from "@repo/ui/button";

interface PatientFiltersProps {
  dniSearch: string;
  setDniSearch: (value: string) => void;
  statusFilter: "all" | "active" | "closed";
  setStatusFilter: (value: "all" | "active" | "closed") => void;
  onSearch: () => void;
}

export function PatientFilters({
  dniSearch,
  setDniSearch,
  statusFilter,
  setStatusFilter,
  onSearch,
}: PatientFiltersProps) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="font-semibold mb-3">BÚSQUEDA Y FILTROS</h3>
      <div className="grid gap-4">
        {/* Búsqueda por paciente/DNI */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Buscar paciente
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              value={dniSearch}
              onChange={(e) => setDniSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="DNI o nombre del paciente..."
              className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filtros de estado */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Filtrar por tratamiento
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Tratamientos activos
            </button>
            <button
              onClick={() => setStatusFilter("closed")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === "closed"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Cerrados
            </button>
          </div>
        </div>

        {/* Botón de búsqueda */}
        <Button onClick={onSearch} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>
    </div>
  );
}
