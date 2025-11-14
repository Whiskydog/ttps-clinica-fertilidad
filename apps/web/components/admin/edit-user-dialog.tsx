"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminUserUpdateSchema, StaffUser, type AdminUserUpdate } from "@repo/contracts";

import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/field";
import { Input } from "@repo/ui/input";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: StaffUser;
  onUpdate: (userId: number, data: AdminUserUpdate) => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  onUpdate,
}: EditUserDialogProps) {
  const form = useForm<AdminUserUpdate>({
    resolver: zodResolver(AdminUserUpdateSchema),
    mode: "onChange",
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      specialty: user.specialty || "",
      licenseNumber: user.licenseNumber || "",
      labArea: user.labArea || "",
    },
  });

  const { isValid, isSubmitting, isDirty } = form.formState;

  // Resetear el form cuando cambia el usuario
  useEffect(() => {
    if (open) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        specialty: user.specialty || "",
        licenseNumber: user.licenseNumber || "",
        labArea: user.labArea || "",
      });
    }
  }, [open, user]);

  const onSubmit = (data: AdminUserUpdate) => {
    onUpdate(user.id, data);
    onOpenChange(false);
  };

  const isDoctor = user.role.code === "doctor";
  const isLabTechnician = user.role.code === "lab_technician";
  const isDirector = user.role.code === "director";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Actualiza los datos de {user.firstName} {user.lastName} ({user.role})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Datos básicos */}
          <div className="space-y-4">
            <div className="bg-blue-900 px-4 py-2.5 rounded">
              <h3 className="text-sm font-semibold text-white">
                Datos personales
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="firstName">Nombre</FieldLabel>
                    <Input {...field} id="firstName" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Apellido */}
              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastName">Apellido</FieldLabel>
                    <Input {...field} id="lastName" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Email */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input {...field} id="email" type="email" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Teléfono */}
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                    <Input {...field} id="phone" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

          </div>

          {/* Campos específicos por rol */}
          {(isDoctor || isLabTechnician || isDirector) && (
            <div className="space-y-4">
              <div className="bg-blue-900 px-4 py-2.5 rounded">
                <h3 className="text-sm font-semibold text-white">
                  Datos profesionales
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Especialidad - Solo Doctor */}
                {isDoctor && (
                  <Controller
                    name="specialty"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="specialty">Especialidad</FieldLabel>
                        <Input {...field} id="specialty" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}

                {/* Matrícula - Doctor y Director */}
                {(isDoctor || isDirector) && (
                  <Controller
                    name="licenseNumber"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="licenseNumber">
                          Matrícula profesional
                        </FieldLabel>
                        <Input {...field} id="licenseNumber" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}

                {/* Área de laboratorio - Solo Lab Technician */}
                {isLabTechnician && (
                  <Controller
                    name="labArea"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="labArea">
                          Área de laboratorio
                        </FieldLabel>
                        <Input {...field} id="labArea" />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={!isValid || isSubmitting || !isDirty}
            >
              {isSubmitting ? "Actualizando..." : "Actualizar usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
