"use client";

import { signInPatient, signInStaff } from "@/app/actions/auth";
import { toast } from "react-hot-toast";
import { Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"patient" | "staff">("patient");
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      let res;
      if (userType === "patient") {
        res = await signInPatient({ dni, password });
      } else {
        res = await signInStaff({ email, password });
      }
      if (res.statusCode !== 200) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
        // Redirect according to user type
        router.push(userType === "patient" ? "/patient" : "/doctor");
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
            <div className="flex items-center gap-4 mb-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="userType"
                  checked={userType === "patient"}
                  onChange={() => setUserType("patient")}
                  className="mr-2"
                />
                Paciente
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="userType"
                  checked={userType === "staff"}
                  onChange={() => setUserType("staff")}
                  className="mr-2"
                />
                Profesional
              </label>
            </div>
            {/* Identifier field: DNI for patients, Email for staff */}
            {userType === "patient" ? (
              <div className="space-y-2">
                <label htmlFor="dni" className="text-gray-700">
                  DNI:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-purple-500" />
                  </div>
                  <input
                    id="dni"
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                    className="pl-10 w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 py-3 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ingrese su DNI"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="email" className="text-gray-700">
                  Email:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-purple-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 py-3 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ingrese su email"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-gray-700">
                Contraseña:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-yellow-600" />
                </div>
                <input
                  id="password"
                  type="password"
                  ref={passwordInputRef}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 w-full rounded-md border border-gray-300 bg-gray-50 text-gray-900 py-3 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Ingrese su contraseña"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base disabled:opacity-50"
            >
              {isPending ? "INGRESANDO..." : "INGRESAR"}
            </button>
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
