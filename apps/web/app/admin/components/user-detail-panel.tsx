"use client";

import { StaffUser } from "./users-management-client";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Separator } from "@repo/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Edit, Key, Trash2, X } from "lucide-react";
import { forwardRef } from "react";

interface UserDetailPanelProps {
  user: StaffUser;
  onClose: () => void;
  onEdit: (user: StaffUser) => void;
  onResetPassword: (user: StaffUser) => void;
  onDelete: (user: StaffUser) => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const UserDetailPanel = forwardRef<HTMLDivElement, UserDetailPanelProps>(
  ({ user, onClose, onEdit, onResetPassword, onDelete }) => {
    return (
      <Card>
        <CardHeader className="bg-blue-900 text-white px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Detalle de Usuario - {user.firstName} {user.lastName}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Columna Izquierda - Información del Usuario (8/12) */}
            <div className="md:col-span-8">
              <Card>
                <CardHeader className="bg-gray-100 px-4 py-3 rounded-t-lg">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Información del Usuario
                  </h3>
                </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID</p>
                  <p className="font-medium text-gray-900">#{user.id}</p>
                </div>

                {/* Nombre Completo */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nombre Completo</p>
                  <p className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>

                {/* Teléfono */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                  <p className="font-medium text-gray-900">{user.phone}</p>
                </div>

                {/* Rol */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rol</p>
                  <p className="font-medium text-gray-900">{user.roleName}</p>
                </div>

                {/* Estado */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Estado</p>
                  <Badge
                    variant={user.isActive ? "default" : "destructive"}
                    className={
                      user.isActive
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {user.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                {/* Fecha de Creación */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Fecha de Creación</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(user.createdAt)}
                  </p>
                </div>

                {/* Último Login */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Último Login</p>
                  <p className="font-medium text-gray-900">
                    {user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}
                  </p>
                </div>
              </div>
              </CardContent>
              </Card>
            </div>

            {/* Columna Derecha - Acciones (4/12) */}
            <div className="md:col-span-4">
              <Card>
                <CardHeader className="bg-gray-100 px-4 py-3 rounded-t-lg">
                  <h3 className="text-lg font-semibold text-gray-900">Acciones</h3>
                </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Botón Editar Usuario */}
              <Button
                onClick={() => onEdit(user)}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Usuario
              </Button>

              <Separator />

              {/* Botón Reset Password */}
              <Button
                onClick={() => onResetPassword(user)}
                variant="outline"
                className="w-full justify-start border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Key className="h-4 w-4 mr-2" />
                Resetear Contraseña
              </Button>

              <Separator />

              {/* AlertDialog para Eliminar Usuario */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Usuario
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente al usuario{" "}
                      <strong>
                        {user.firstName} {user.lastName}
                      </strong>{" "}
                      ({user.email}). Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(user)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirmar Eliminación
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
        </CardContent>
      </Card>
    );
  }
);

UserDetailPanel.displayName = "UserDetailPanel";
