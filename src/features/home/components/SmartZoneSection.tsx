/*
Este código define un componente de React llamado SmartZoneSection para una aplicación de
Next.js, el cual renderiza una sección de aterrizaje promocional para "Urbik Smart Zone",
una herramienta de análisis inmobiliario asistida por inteligencia artificial. Presenta un panel 
visualmente impactante con modo oscuro y acentos en verde
esmeralda que detalla funciones avanzadas como la comparación de propiedades, el análisis
de rentabilidad y un indicador de puntuación (score) de zona. El componente utiliza Tailwind
CSS para el estilizado responsivo, animaciones sutiles y efectos de gradiente.
*/

import Link from "next/link";

export function SmartZoneSection() {
  return (
    <div className="w-full bg-urbik-black py-20 px-6 mt-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-urbik-emerald/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-50 right-1/4 w-96 h-96 bg-urbik-emerald/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto border border-urbik-emerald/30 bg-linear-to-br from-gray-900 to-black rounded-3xl p-8 md:p-16 relative z-10 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]">
        <div className="absolute top-8 right-8 z-20 opacity-80 hover:opacity-100 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Urbik_Logo_Smart_Zone.svg"
            alt="Smart Zone Logo"
            className="h-12 w-auto drop-shadow-[0_0_3px_rgba(16,185,129,1)]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-urbik-emerald text-black text-sm font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Exclusivo Urbik
              </span>
              <div className="h-px w-20 bg-urbik-emerald/50" />
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-none tracking-tighter">
              NO SOLO BUSQUES. <br />
              <span className="text-urbik-emerald">DECIDÍ CON</span>
              <span className="text-urbik-emerald italic font-black">
                {" "}
                INTELIGENCIA.
              </span>
            </h2>

            <p className="text-gray-400 text-lg md:text-xl font-medium mb-8 leading-relaxed max-w-xl">
              Presentamos{" "}
              <span className="text-white font-bold">Urbik Smart Zone®</span>,
              la primera herramienta de análisis comparativo asistida por IA que
              transforma datos complejos en veredictos claros de inversión.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                "Comparación en tiempo real de hasta 5 propiedades.",
                "Análisis de brecha de precio por m² vs promedio de zona.",
                "Veredicto algorítmico de rentabilidad y ubicación.",
                "Visualización de capas de datos catastrales exclusivos.",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-gray-300 font-semibold"
                >
                  <div className="w-2 h-2 rounded-full bg-urbik-emerald shadow-[0_0_8px_rgba(16,185,129,1)]" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/map"
              className="inline-block bg-urbik-emerald hover:bg-emerald-400 text-black font-black px-10 py-4 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] uppercase tracking-tighter"
            >
              Probar Smart Zone ahora
            </Link>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-urbik-emerald/50 to-emerald-900/30 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Urbik_Logo_Smart_Zone.svg"
                  alt="Smart Zone"
                  className="h-6 brightness-0 invert"
                />
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-urbik-emerald" />
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="h-24 bg-urbik-emerald/10 border border-urbik-emerald/20 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-urbik-emerald font-black text-2xl">
                        9.8
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase">
                        Score de la Zona
                      </span>
                    </div>
                    <div className="h-24 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-white font-black text-2xl">
                        -$12k
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase">
                        vs Mercado
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-emerald-500/5 border border-urbik-emerald/20">
                    <p className="text-[12px] italic text-emerald-200/70 text-center">
                      &quot;Esta propiedad presenta un precio un 12% inferior al
                      promedio de la zona...&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
