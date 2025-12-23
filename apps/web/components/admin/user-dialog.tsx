"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AdminUserCreate,
  AdminUserCreateSchema,
  TurnoHorario,
} from "@repo/contracts";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { toast } from "@repo/ui";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { RefreshCw, Plus, Trash2 } from "lucide-react";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: AdminUserCreate) => void;
}

const DIAS_SEMANA = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export function UserDialog({ open, onOpenChange, onSave }: UserDialogProps) {
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [turnos, setTurnos] = useState<TurnoHorario[]>([]);

  const form = useForm<AdminUserCreate>({
    resolver: zodResolver(AdminUserCreateSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      isActive: true,
    },
  });

  const userType = form.watch("userType");
  const { isValid, isSubmitting } = form.formState;

  useEffect(() => {
    if (userType && userType !== selectedUserType) {
      setSelectedUserType(userType);
    }
  }, [userType, selectedUserType]);

  // Generar contraseña
  useEffect(() => {
    if (open) {
      const password = generateRandomPassword();
      form.setValue("password", password);
    } else {
      form.reset();
      setSelectedUserType("");
      setTurnos([]);
    }
  }, [open]);

  const onSubmit = (data: AdminUserCreate) => {
    // Incluir turnos solo si es médico
    const dataWithTurnos = data.userType === "doctor" && turnos.length > 0
      ? { ...data, turnos }
      : data;
    onSave(dataWithTurnos);
    form.reset();
    setSelectedUserType("");
    setTurnos([]);
    onOpenChange(false);
  };

  const agregarTurno = () => {
    setTurnos([...turnos, { dia_semana: 1, hora_inicio: "08:00", hora_fin: "12:00" }]);
  };

  const actualizarTurno = (index: number, campo: keyof TurnoHorario, valor: string | number) => {
    const nuevosTurnos = [...turnos];
    nuevosTurnos[index] = { ...nuevosTurnos[index], [campo]: valor };
    setTurnos(nuevosTurnos);
  };

  const eliminarTurno = (index: number) => {
    setTurnos(turnos.filter((_, i) => i !== index));
  };

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // Asegurar al menos una mayúscula, una minúscula, un número y un carácter especial
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    // Completar el resto de la contraseña
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGeneratePassword = () => {
    const password = generateRandomPassword();
    form.setValue("password", password);

    // Copiar al portapapeles
    navigator.clipboard.writeText(password).then(() => {
      toast.success("Contraseña generada y copiada al portapapeles");
    }).catch(() => {
      toast.success("Contraseña generada");
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear nuevo usuario</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear un nuevo usuario en el sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            {/* DATOS BÁSICOS */}
            <div className="space-y-4">
              <div className="bg-blue-900 px-4 py-2.5 rounded">
                <h2 className="text-white font-semibold text-base">
                  Datos básicos
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nombre */}
                <div className="space-y-2">
                  <Controller
                    name="firstName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="firstName">Nombre 🞲</FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="Nombre"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                {/* Apellido */}
                <div className="space-y-2">
                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="lastName">Apellido 🞲</FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="Apellido"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email (login) */}
                <div className="space-y-2">
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="email">Email (login) 🞲</FieldLabel>
                        <Input
                          {...field}
                          type="email"
                          aria-invalid={fieldState.invalid}
                          placeholder="correo@dominio.com"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="phone">Teléfono 🞲</FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="+54 221 ..."
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Estado Inicial */}
                <div className="space-y-2">
                  <Controller
                    name="isActive"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="isActive">
                          Estado Inicial
                        </FieldLabel>
                        <Select
                          value={field.value ? "active" : "inactive"}
                          onValueChange={(value) =>
                            field.onChange(value === "active")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                {/* Tipo de usuario */}
                <div className="space-y-2">
                  <Controller
                    name="userType"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="userType">
                          Tipo de usuario 🞲
                        </FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar: Médico / Operador de Laboratorio / Admin / Director" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="doctor">Médico</SelectItem>
                            <SelectItem value="lab_technician">
                              Operador de Laboratorio
                            </SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="password">
                          Contraseña temporal 🞲
                        </FieldLabel>
                        <div className="flex gap-2">
                          <Input
                            {...field}
                            type="text"
                            aria-invalid={fieldState.invalid}
                            placeholder="Contraseña generada automáticamente"
                            className="font-mono"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleGeneratePassword}
                            title="Generar nueva contraseña"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <p className="text-sm text-gray-500 italic pb-2">
                  La contraseña se genera automáticamente. Puedes editarla o regenerarla.
                </p>
              </div>
            </div>

            {/* DATOS DE MÉDICO */}
            {selectedUserType === "doctor" && (
              <div className="space-y-4">
                <div className="bg-blue-900 px-4 py-2.5 rounded">
                  <h2 className="text-white font-semibold text-base">
                    Datos de Médico — Visible si (Tipo de usuario = Médico)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Matrícula profesional */}
                  <div className="space-y-2">
                    <Controller
                      name="licenseNumber"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="licenseNumber">
                            Matrícula profesional
                          </FieldLabel>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            placeholder="N° matrícula"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  {/* Especialidad */}
                  <div className="space-y-2">
                    <Controller
                      name="specialty"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="specialty">
                            Especialidad
                          </FieldLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Ginecología y Obstetricia / Andrología / Fertilidad ▼" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ginecologia">
                                Ginecología y Obstetricia
                              </SelectItem>
                              <SelectItem value="andrologia">
                                Andrología
                              </SelectItem>
                              <SelectItem value="fertilidad">
                                Fertilidad
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                </div>

                {/* CONFIGURACIÓN DE TURNOS */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                      Configuración de Turnos (opcional)
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={agregarTurno}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar turno
                    </Button>
                  </div>

                  {turnos.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No hay turnos configurados. Los turnos se crearán automáticamente en el sistema del turnero.
                    </p>
                  )}

                  {turnos.map((turno, index) => (
                    <div key={index} className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs text-gray-600">Día</label>
                        <Select
                          value={String(turno.dia_semana)}
                          onValueChange={(value) => actualizarTurno(index, "dia_semana", parseInt(value))}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIAS_SEMANA.map((dia) => (
                              <SelectItem key={dia.value} value={String(dia.value)}>
                                {dia.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-28 space-y-1">
                        <label className="text-xs text-gray-600">Inicio</label>
                        <Input
                          type="time"
                          value={turno.hora_inicio}
                          onChange={(e) => actualizarTurno(index, "hora_inicio", e.target.value)}
                          className="h-9"
                        />
                      </div>

                      <div className="w-28 space-y-1">
                        <label className="text-xs text-gray-600">Fin</label>
                        <Input
                          type="time"
                          value={turno.hora_fin}
                          onChange={(e) => actualizarTurno(index, "hora_fin", e.target.value)}
                          className="h-9"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => eliminarTurno(index)}
                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DATOS DE OPERADOR DE LABORATORIO */}
            {selectedUserType === "lab_technician" && (
              <div className="space-y-4">
                <div className="bg-blue-900 px-4 py-2.5 rounded">
                  <h2 className="text-white font-semibold text-base">
                    Datos de Operador de Laboratorio — Visible si (Tipo de
                    usuario = Operador)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Área / Sección */}
                  <div className="space-y-2">
                    <Controller
                      name="labArea"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="labArea">
                            Área / Sección
                          </FieldLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Embriología / Andrología / Genética ▼" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="embriologia">
                                Embriología
                              </SelectItem>
                              <SelectItem value="andrologia">
                                Andrología
                              </SelectItem>
                              <SelectItem value="genetica">Genética</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>


                </div>
              </div>
            )}

            {/* DATOS DE DIRECTOR */}
            {selectedUserType === "director" && (
              <div className="space-y-4">
                <div className="bg-blue-900 px-4 py-2.5 rounded">
                  <h2 className="text-white font-semibold text-base">
                    Datos de Director — Visible si (Tipo de usuario = Director)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matrícula profesional */}
                  <div className="space-y-2">
                    <Controller
                      name="licenseNumber"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="licenseNumber">
                            Matrícula profesional
                          </FieldLabel>
                          <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            placeholder="N° matrícula"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </FieldGroup>

          <DialogFooter className="flex justify-end gap-2">
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
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
