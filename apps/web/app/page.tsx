import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Clínica de Fertilidad
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema de gestión integral para clínicas de fertilidad
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Registrarse
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Para Pacientes</h3>
            <p className="text-gray-600 text-sm">
              Gestiona tus citas, consulta resultados y mantén tu historial médico actualizado
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Para Médicos</h3>
            <p className="text-gray-600 text-sm">
              Acceso completo a historiales, gestión de tratamientos y seguimiento de pacientes
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Para Administradores</h3>
            <p className="text-gray-600 text-sm">
              Control total del sistema, usuarios, reportes y configuraciones
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
