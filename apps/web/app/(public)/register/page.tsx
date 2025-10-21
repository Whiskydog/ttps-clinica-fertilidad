'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/select';
import { RadioGroup, RadioGroupItem } from '@repo/ui/radio-group';
import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    sexoBiologico: '',
    ocupacion: '',
    telefono: '',
    email: '',
    direccion: '',
    obraSocial: '',
    numeroSocio: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register attempt:', formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* INFORMACIÓN PERSONAL */}
          <div className="space-y-4">
            <div className="bg-slate-400 px-4 py-2.5 rounded">
              <h2 className="text-black font-semibold text-base">
                INFORMACIÓN PERSONAL
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-gray-700">
                  Nombre: *
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido" className="text-gray-700">
                  Apellido: *
                </Label>
                <Input
                  id="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dni" className="text-gray-700">
                  DNI: *
                </Label>
                <Input
                  id="dni"
                  type="text"
                  value={formData.dni}
                  onChange={(e) => handleChange('dni', e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento" className="text-gray-700">
                  Fecha de Nacimiento: *
                </Label>
                <Input
                  id="fechaNacimiento"
                  type="text"
                  value={formData.fechaNacimiento}
                  onChange={(e) =>
                    handleChange('fechaNacimiento', e.target.value)
                  }
                  required
                  placeholder="DD-MM-AAAA"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Sexo Biológico: *</Label>
                <RadioGroup
                  value={formData.sexoBiologico}
                  onValueChange={(value) =>
                    handleChange('sexoBiologico', value)
                  }
                  className="flex gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="femenino" id="femenino" />
                    <Label
                      htmlFor="femenino"
                      className="text-gray-700 font-normal cursor-pointer"
                    >
                      Femenino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="masculino" id="masculino" />
                    <Label
                      htmlFor="masculino"
                      className="text-gray-700 font-normal cursor-pointer"
                    >
                      Masculino
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ocupacion" className="text-gray-700">
                Ocupación:
              </Label>
              <Input
                id="ocupacion"
                type="text"
                value={formData.ocupacion}
                onChange={(e) => handleChange('ocupacion', e.target.value)}
                className="bg-white border-gray-300 text-gray-900"
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
                <Label htmlFor="telefono" className="text-gray-700">
                  Teléfono: *
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email: *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-gray-700">
                Dirección:
              </Label>
              <Input
                id="direccion"
                type="text"
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                className="bg-white border-gray-300 text-gray-900"
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
                <Label htmlFor="obraSocial" className="text-gray-700">
                  Obra Social / Prepaga: *
                </Label>
                <Select
                  value={formData.obraSocial}
                  onValueChange={(value) => handleChange('obraSocial', value)}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="osde">OSDE</SelectItem>
                    <SelectItem value="swiss-medical">Swiss Medical</SelectItem>
                    <SelectItem value="galeno">Galeno</SelectItem>
                    <SelectItem value="medicus">Medicus</SelectItem>
                    <SelectItem value="pami">PAMI</SelectItem>
                    <SelectItem value="otra">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroSocio" className="text-gray-700">
                  Número de Socio: *
                </Label>
                <Input
                  id="numeroSocio"
                  type="text"
                  value={formData.numeroSocio}
                  onChange={(e) => handleChange('numeroSocio', e.target.value)}
                  required
                  className="bg-white border-gray-300 text-gray-900"
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
                <Label htmlFor="password" className="text-gray-700">
                  Contraseña: *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  minLength={8}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Repetir Contraseña: *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange('confirmPassword', e.target.value)
                  }
                  required
                  minLength={8}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <p className="text-xs text-gray-600 italic">
              La contraseña debe tener al menos 8 caracteres, una mayúscula y un
              número
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-6 text-base"
            >
              CREAR CUENTA
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
