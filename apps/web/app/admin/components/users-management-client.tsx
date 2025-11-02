"use client";

import { useState, useMemo, useRef, useEffect, useTransition } from "react";
import { UserFilters } from "./user-filters";
import { UsersTable } from "./users-table";
import { UsersPagination } from "./users-pagination";
import { UserDialog } from "./user-dialog";
import { UserDetailPanel } from "./user-detail-panel";
import { useUserFilters } from "../hooks/use-user-filters";
import { Card } from "@repo/ui/card";
import { AdminUserCreate, UserEntity, UsersList } from "@repo/contracts";
import { toast } from "@repo/ui";
import { createStaffUser, deleteUser, toggleUserStatus } from "@/app/actions/users";
import { useRouter } from "next/navigation";

export interface StaffUser extends Omit<UserEntity, "role" | "createdAt" | "updatedAt"> {
  role: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
  specialty?: string;
  licenseNumber?: string;
  labArea?: string;
}

interface UsersManagementClientProps {
  initialData: UsersList;
}

export function UsersManagementClient({
  initialData,
}: UsersManagementClientProps) {
  const router = useRouter();
  const { filters, updateFilter, resetFilters } = useUserFilters();
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const users: StaffUser[] = useMemo(() => {
    return initialData.data.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role.code,
      roleName: user.role.name,
      isActive: user.isActive,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      specialty: user.specialty,
      licenseNumber: user.licenseNumber,
      labArea: user.labArea,
    }));
  }, [initialData]);

  const pageSize = initialData.meta.perPage;
  const totalItems = initialData.meta.total;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.role !== "all" && user.role !== filters.role) {
        return false;
      }
      if (filters.status !== "all") {
        const isActive = filters.status === "active";
        if (user.isActive !== isActive) return false;
      }

      return true;
    });
  }, [filters, users]);


  const handleEditUser = (user: StaffUser) => {
    // setEditingUser(user);
    // abrir un dialog igual al de crear usuario con los datos actuales
  };

  const handleToggleStatus = async (user: StaffUser) => {
    const newStatus = !user.isActive;
    const response = await toggleUserStatus(user.id, newStatus);

    if ("errors" in response) {
      toast.error("Error de validación al cambiar el estado");
    } else if (response.statusCode === 200) {
      toast.success(
        `Usuario ${newStatus ? "activado" : "desactivado"} correctamente`
      );
      router.refresh();
    } else {
      toast.error(response.message || "Error al cambiar el estado");
    }
  };

  const handleResetPassword = (user: StaffUser) => {
    toast.info("Funcionalidad de reseteo de contraseña en desarrollo");
    // para el reset de pw abrir un dialog donde hacer la modificacion
  };

  const handleDeleteUser = async (user: StaffUser) => {
    const response = await deleteUser(user.id);

    if (response.statusCode === 204 || response.statusCode === 200) {
      toast.success("Usuario eliminado correctamente");
      setSelectedUser(null);
      router.refresh();
    } else {
      toast.error(response.message || "Error al eliminar el usuario");
    }
  };

  const handleSaveUser = async (data: AdminUserCreate) => {
    // startTransition(async () => {
      const response = await createStaffUser(data);

      if ("errors" in response) {
        toast.error("Error de validación. Revisa los campos.");
        console.log("Validation errors:", response.errors);
      } else if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message || "Usuario creado correctamente");
        setIsDialogOpen(false);
        router.refresh();
      } else {
        toast.error(response.message || "Error al crear el usuario");
        console.log("Server error:", response);
      }
    // });
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Usuarios registrados
        </h1>
      </div>

      {/* Filtros */}
      <UserFilters
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        onNewUser={() => {
          setIsDialogOpen(true);
        }}
      />

      {/* Tabla */}
      <Card>
        <UsersTable
          users={filteredUsers}
          onViewUser={(user: StaffUser) => {
            setSelectedUser(user);
          }}
          onEditUser={handleEditUser}
          onToggleStatus={handleToggleStatus}
          onDeleteUser={handleDeleteUser}
        />

        {/* Paginación */}
        {totalItems > 0 && (
          <UsersPagination
            currentPage={initialData.meta.page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={(newPage: number) => {
              router.push(`/admin?page=${newPage}&perPage=${pageSize}`);
            }}
          />
        )}
      </Card>

      {/* Dialog crear usuario */}
      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveUser}
      />

      {/* Panel de detalle */}
      {selectedUser && !isDialogOpen && (
        <UserDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={handleEditUser}
          onResetPassword={handleResetPassword}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  );
}
