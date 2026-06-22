import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="relative mb-8 select-none">
        <span className="text-[10rem] font-black leading-none tracking-tighter text-geora-black/[0.04]">
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-[5.5rem] font-black leading-none tracking-tighter text-geora-cyan">
          404
        </span>
      </div>

      <div className="max-w-sm text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-geora-black/5">
            <SearchX size={28} className="text-geora-black/40" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-geora-black uppercase tracking-tight mb-3">
          Página no encontrada
        </h1>
        <p className="text-geora-black/50 text-sm leading-relaxed">
          La propiedad o sección que buscás no existe o fue removida. Podés volver al inicio y seguir explorando.
        </p>
      </div>

      <Link
        href="/"
        className="flex items-center gap-2 rounded-full bg-geora-black px-7 py-3.5 text-sm font-bold text-white shadow-md hover:opacity-85 transition-opacity"
      >
        <Home size={16} />
        Volver al inicio
      </Link>
    </div>
  );
}
