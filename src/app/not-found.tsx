import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-6xl font-black text-gray-200">404</h2>
      <p className="text-xl font-semibold mt-4">Página no encontrada</p>
      <p className="text-gray-500 mt-2">Lo sentimos, la propiedad o sección que buscas no existe.</p>
      <Link href="/" className="mt-6 text-blue-500 underline">
        Regresar a la inmobiliaria
      </Link>
    </div>
  );
}