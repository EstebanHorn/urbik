"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h2 className="text-2xl font-bold text-gray-800">¡Algo salió mal!</h2>
      <p className="text-gray-600 mt-2 mb-6">Ha ocurrido un error inesperado en el servidor.</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-gray-800 text-white rounded-md"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}