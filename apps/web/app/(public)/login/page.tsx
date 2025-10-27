"use client";

import { signInPatient } from "@/app/actions/auth";
import { toast } from "@repo/ui";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await signInPatient({ dni, password });
      if ("error" in res) {
        toast.error(
          "Error en el inicio de sesión: " + (res.message ?? res.error)
        );
        passwordInputRef.current?.focus();
      } else {
        router.push("/patient");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">
          CLÍNICA AMELIA
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sistema de Gestión de Fertilidad
        </p>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
            INICIAR SESIÓN
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* DNI Field */}
            <div className="space-y-2">
              <Label htmlFor="dni" className="text-gray-700">
                DNI:
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-purple-500" />
                </div>
                <Input
                  id="dni"
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  required
                  className="pl-10 bg-gray-50 border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ingrese su DNI"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Contraseña:
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-yellow-600" />
                </div>
                <Input
                  id="password"
                  type="password"
                  ref={passwordInputRef}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-gray-50 border-gray-300 text-gray-900 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Ingrese su contraseña"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base"
            >
              {isPending ? "INGRESANDO..." : "INGRESAR"}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            ¿Desea iniciar un tratamiento?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500 underline font-medium"
            >
              Regístrese aquí
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          © 2025 Clínica Amelia - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
