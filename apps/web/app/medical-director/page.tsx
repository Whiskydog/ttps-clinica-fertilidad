import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Users, FileText, Shield, ArrowRight, CreditCard } from "lucide-react";

export default function MedicalDirectorDashboard() {
  const quickActions = [
    {
      title: "Ver Pacientes",
      description: "Acceder a la lista completa de pacientes del sistema",
      href: "/medical-director/patients",
      icon: Users,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Órdenes Médicas",
      description: "Gestionar órdenes médicas de todos los tratamientos",
      href: "/medical-director/orders",
      icon: FileText,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Panel de Auditoría",
      description: "Revisar cambios y modificaciones en el sistema",
      href: "/medical-director/audit",
      icon: Shield,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Procesar Pagos",
      description: "Gestión de pagos y deudas de Obras Sociales",
      href: "/medical-director/pagos",
      icon: CreditCard,
      color: "bg-pink-500 hover:bg-pink-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Director Médico</h1>
        <p className="text-muted-foreground">
          Acceso completo a pacientes, tratamientos y auditoría del sistema
        </p>
      </div>

      {/* Información del rol */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Permisos de Director Médico</CardTitle>
          <CardDescription className="text-blue-600">
            Como Director Médico tienes acceso completo al sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ul className="list-disc list-inside space-y-1">
            <li>Ver y editar historias clínicas de todos los pacientes</li>
            <li>Ver y editar tratamientos de todos los médicos</li>
            <li>Reasignar pacientes entre médicos</li>
            <li>Acceder al panel de auditoría completo</li>
          </ul>
        </CardContent>
      </Card>

      {/* Accesos Rápidos */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.href} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={action.href}>
                      Ir a {action.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
