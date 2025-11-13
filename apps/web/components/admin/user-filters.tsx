"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Plus } from "lucide-react";
import { UserFilters as UserFiltersType } from "../hooks/use-user-filters";

interface UserFiltersProps {
  filters: UserFiltersType;
  onFilterChange: (key: keyof UserFiltersType, value: string) => void;
  onReset: () => void;
  onNewUser: () => void;
}

export function UserFilters({
  filters,
  onFilterChange,
  onReset,
  onNewUser,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end justify-between mb-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        {/* Búsqueda */}
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Buscar por nombre o email"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full"
          />
        </div>

        {/* Rol */}
        <div className="min-w-[180px]">
          <Select
            value={filters.role}
            onValueChange={(value) => onFilterChange("role", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rol: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="lab_technician">
                Operador de Laboratorio
              </SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="patient">Paciente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estado */}
        <div className="min-w-[180px]">
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botones Aplicar/Restablecer */}
        <div className="flex gap-2">
          {/* <Button onClick={onApply} className="bg-green-600 hover:bg-green-700">
            Aplicar
          </Button> */}
          <Button variant="outline" onClick={onReset}>
            Restablecer
          </Button>
        </div>
      </div>

      {/* Botón Nuevo Usuario */}
      <Button
        onClick={onNewUser}
        className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Usuario
      </Button>
    </div>
  );
}
