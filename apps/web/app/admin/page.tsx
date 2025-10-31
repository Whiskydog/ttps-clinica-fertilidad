import Link from "next/link";
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  Settings,
  Shield,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-1 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          Dashboard Administrador
        </h1>
        <p className="text-muted mt-1">
          Panel de control administrativo. Gestiona usuarios, configuraciones y
          reportes del sistema.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">
                  Total Usuarios
                </p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">
                  Pacientes Activos
                </p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">
                  Reportes Generados
                </p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small text-muted-foreground">
                  Sistema Activo
                </p>
                <p className="text-2xl font-bold text-foreground">100%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Administrative Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-heading-3">Gestión del Sistema</h2>
            <p className="text-small text-muted-foreground">
              Funciones administrativas y de configuración
            </p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/admin/users"
                className="btn-primary justify-start h-auto p-4"
              >
                <Users className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Gestionar Usuarios</div>
                  <div className="text-sm opacity-90">
                    Administra roles y permisos
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/config"
                className="btn-secondary justify-start h-auto p-4"
              >
                <Settings className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Configuración</div>
                  <div className="text-sm opacity-90">Ajustes del sistema</div>
                </div>
              </Link>

              <Link
                href="/admin/reports"
                className="btn-secondary justify-start h-auto p-4"
              >
                <FileText className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Reportes</div>
                  <div className="text-sm opacity-90">
                    Estadísticas y análisis
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/audit"
                className="btn-secondary justify-start h-auto p-4"
              >
                <Shield className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Auditoría</div>
                  <div className="text-sm opacity-90">
                    Registro de actividades
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-heading-3">Estado del Sistema</h2>
            <p className="text-small text-muted-foreground">
              Información sobre el estado actual del sistema
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-green-800">Base de Datos</p>
                    <p className="text-sm text-green-600">
                      Conectada y operativa
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-green-800">API Backend</p>
                    <p className="text-sm text-green-600">
                      Respondiendo correctamente
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-yellow-800">
                      Sistema de Backup
                    </p>
                    <p className="text-sm text-yellow-600">
                      Último backup: hace 2 horas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Setup */}
      <div className="card mt-8">
        <div className="card-header">
          <h2 className="text-heading-3">Configuración Inicial</h2>
          <p className="text-small text-muted-foreground">
            Pasos recomendados para configurar el sistema médico
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold mb-2">Configurar Usuarios</h3>
              <p className="text-small text-muted-foreground">
                Crea cuentas para médicos, administrativos y técnicos
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold mb-2">Verificar Permisos</h3>
              <p className="text-small text-muted-foreground">
                Asegúrate de que cada rol tenga los permisos adecuados
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold mb-2">Configurar Alertas</h3>
              <p className="text-small text-muted-foreground">
                Establece notificaciones para eventos importantes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
