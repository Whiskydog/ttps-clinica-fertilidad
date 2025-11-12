"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema, type ResetPassword } from "@repo/contracts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Field, FieldError, FieldLabel } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import { toast } from "@repo/ui";
import { Copy, RefreshCw } from "lucide-react";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  onResetPassword: (userId: number, password: string) => void;
}

function generateSecurePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onResetPassword,
}: ResetPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  const form = useForm<ResetPassword>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
    },
  });

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    form.setValue("password", newPassword, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleCopyPassword = async () => {
    const password = form.getValues("password");
    if (password) {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success("Contraseña copiada al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const onSubmit = (data: ResetPassword) => {
    onResetPassword(userId, data.password);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            Establece una nueva contraseña temporal para <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">
                    Nueva contraseña temporal
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      id="password"
                      type="text"
                      placeholder="Generar o ingresar contraseña"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleGeneratePassword}
                      title="Generar contraseña"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyPassword}
                      disabled={!field.value}
                      title="Copiar contraseña"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <p className="text-sm text-gray-500">
              La contraseña debe tener al menos 8 caracteres. Puedes generarla automáticamente o ingresarla manualmente.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || !form.formState.isDirty}
            >
              Restablecer contraseña
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
