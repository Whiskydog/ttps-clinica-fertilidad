"use client";

import { signUp } from "@/app/actions/auth";
import { getMedicalInsurances, MedicalInsurance } from "@/app/actions/medical-insurances";
import { setValidationErrors } from "@/utils/rhf-utils";
import { DateOfBirthInput } from "@/components/ui/date-of-birth-input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BiologicalSex,
  PatientSignUp,
  PatientSignUpSchema,
} from "@repo/contracts";
import { toast } from "@repo/ui";
import { Button } from "@repo/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [medicalInsurances, setMedicalInsurances] = useState<MedicalInsurance[]>([]);
  const [isLoadingInsurances, setIsLoadingInsurances] = useState(true);

  useEffect(() => {
    async function loadInsurances() {
      setIsLoadingInsurances(true);
      const insurances = await getMedicalInsurances();
      setMedicalInsurances(insurances);
      setIsLoadingInsurances(false);
    }
    loadInsurances();
  }, []);

  const form = useForm<PatientSignUp>({
    resolver: zodResolver(PatientSignUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      dni: "",
      dateOfBirth: "",
      medicalInsuranceName: "",
      insuranceNumber: "",
      occupation: "",
    },
  });

  const onSubmit = (data: PatientSignUp) => {
    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", {
        message: "Las contraseñas no coinciden",
      });
      return;
    }

    startTransition(async () => {
      const res = await signUp(data);
      if ("errors" in res) {
        // Validation errors
        setValidationErrors(res.errors, form.setError, true);
      } else if ("error" in res) {
        // General error (e.g., "Obra social inválida")
        toast.error(res.message || "Error en el registro");
      } else {
        router.push("/login");
        toast.success(res.message || "Registro exitoso");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Ingrese sus datos para sacar turno
        </h1>
        <p className="text-red-500 text-sm mb-6">* Campos obligatorios</p>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            {/* INFORMACIÓN PERSONAL */}
            <div className="space-y-4">
              <div className="bg-slate-400 px-4 py-2.5 rounded">
                <h2 className="text-black font-semibold text-base">
                  INFORMACIÓN PERSONAL
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="firstName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="firstName"
                          className="text-gray-700"
                        >
                          Nombre: *
                        </FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="Juan"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Controller
                    name="lastName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="lastName"
                          className="text-gray-700"
                        >
                          Apellido: *
                        </FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="Pérez"
                          autoComplete="off"
                          className="bg-white border-gray-300 text-gray-900"
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
                <div className="space-y-2">
                  <Controller
                    name="dni"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="dni" className="text-gray-700">
                          DNI: *
                        </FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="12345678"
                          autoComplete="off"
                          className="bg-white border-gray-300 text-gray-900"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Controller
                    name="dateOfBirth"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="dateOfBirth"
                          className="text-gray-700"
                        >
                          Fecha de Nacimiento: *
                        </FieldLabel>
                        <DateOfBirthInput
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isPending}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Controller
                    name="biologicalSex"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="biologicalSex"
                          className="text-gray-700"
                        >
                          Sexo Biológico: *
                        </FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BiologicalSex.MALE}>
                              Masculino
                            </SelectItem>
                            <SelectItem value={BiologicalSex.FEMALE}>
                              Femenino
                            </SelectItem>
                            <SelectItem value={BiologicalSex.INTERSEX}>
                              Intersexual
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

              <div className="space-y-2">
                <Controller
                  name="occupation"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="occupation"
                        className="text-gray-700"
                      >
                        Ocupación:
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="Ej: Estudiante, Empleado, etc."
                        autoComplete="off"
                        className="bg-white border-gray-300 text-gray-900"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* DATOS DE CONTACTO */}
            <div className="space-y-4">
              <div className="bg-slate-400 px-4 py-2.5 rounded">
                <h2 className="text-black font-semibold text-base">
                  DATOS DE CONTACTO
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="phone" className="text-gray-700">
                          Teléfono: *
                        </FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="+54 9 11 1234 5678"
                          autoComplete="off"
                          className="bg-white border-gray-300 text-gray-900"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="email" className="text-gray-700">
                          Email: *
                        </FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="Ej: nombre@ejemplo.com"
                          autoComplete="off"
                          className="bg-white border-gray-300 text-gray-900"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Controller
                  name="address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="address" className="text-gray-700">
                        Dirección:
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder="Calle, Número, Ciudad, Código Postal"
                        autoComplete="off"
                        className="bg-white border-gray-300 text-gray-900"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* COBERTURA MÉDICA */}
            <div className="space-y-4">
              <div className="bg-slate-400 px-4 py-2.5 rounded">
                <h2 className="text-black font-semibold text-base">
                  COBERTURA MÉDICA
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="medicalInsuranceName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="medicalInsuranceName"
                          className="text-gray-700"
                        >
                          Obra Social / Prepaga: *
                        </FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoadingInsurances}
                        >
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                            <SelectValue placeholder={isLoadingInsurances ? "Cargando..." : "Seleccione..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {medicalInsurances.length === 0 && !isLoadingInsurances ? (
                              <div className="px-2 py-1.5 text-sm text-gray-500">
                                No hay obras sociales disponibles
                              </div>
                            ) : (
                              medicalInsurances.map((insurance) => (
                                <SelectItem key={insurance.id} value={insurance.name}>
                                  {insurance.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Controller
                    name="insuranceNumber"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="insuranceNumber"
                          className="text-gray-700"
                        >
                          Número de Socio: *
                        </FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          placeholder="Ej: 123456789"
                          autoComplete="off"
                          className="bg-white border-gray-300 text-gray-900"
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

            {/* DATOS DE ACCESO */}
            <div className="space-y-4">
              <div className="bg-slate-400 px-4 py-2.5 rounded">
                <h2 className="text-black font-semibold text-base">
                  DATOS DE ACCESO
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="password"
                          className="text-gray-700"
                        >
                          Contraseña: *
                        </FieldLabel>
                        <Input
                          {...field}
                          type="password"
                          aria-invalid={fieldState.invalid}
                          className="bg-white border-gray-300 text-gray-900"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Controller
                    name="confirmPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel
                          htmlFor="confirmPassword"
                          className="text-gray-700"
                        >
                          Repetir Contraseña: *
                        </FieldLabel>
                        <Input
                          {...field}
                          type="password"
                          aria-invalid={fieldState.invalid}
                          className="bg-white border-gray-300 text-gray-900"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-600 italic">
                La contraseña debe tener al menos 8 caracteres, una mayúscula y
                un número
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-6 text-base"
              >
                {isPending ? "REGISTRANDO..." : "CREAR CUENTA"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
