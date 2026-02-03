import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold text-red-600">403 - Acceso Denegado</h1>
      <p className="mt-4 text-gray-600 max-w-md">
        No tienes los permisos necesarios para ver esta sección. Si crees que esto es un error, contacta al administrador.
      </p>
      <Link 
        href="/" 
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Volver al Inicio
      </Link>
    </div>
  );
}