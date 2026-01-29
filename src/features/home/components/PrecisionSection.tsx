/*
Este código define un componente de React llamado PrecisionSection que renderiza una sección
informativa y visualmente atractiva para una plataforma de inversiones inmobiliarias o catastrales.
Estructuralmente, utiliza un diseño de cuadrícula (grid) de Tailwind CSS para dividir el contenido
en dos columnas principales: la izquierda presenta un encabezado estilizado sobre la "precisión
quirúrgica" de los datos y una lista de características clave (usando el subcomponente reutilizable
FeatureItem), mientras que la derecha muestra una imagen representativa con efectos de hover y
gradientes. El propósito principal del componente es comunicar confianza y exactitud técnica al
usuario, destacando la integración de datos oficiales y la visualización de geometrías de parcelas
mediante una interfaz moderna y responsiva.
*/

import image from '../../../assets/image.png'

export function PrecisionSection() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-[2px] bg-urbik-black/20" />
            <span className="text-sm font-bold tracking-[0.2em] text-urbik-muted uppercase">
              Precisión Quirúrgica
            </span>
          </div>
          <h2 className="text-5xl font-black text-urbik-dark leading-none mb-6 tracking-tighter">
            LA FORMA REAL <br />
            <span className="italic font-light">DE TU PRÓXIMA</span> <br />
            INVERSIÓN.
          </h2>
          <p className="text-urbik-muted text-lg font-medium leading-relaxed mb-8">
            No nos conformamos con una dirección aproximada. Integramos{" "}
            <strong>capas de datos catastrales oficiales</strong>.
          </p>
          <div className="grid grid-cols-1 gap-6">
            <FeatureItem
              title="Geometría de Parcela"
              desc="Visualizá los límites reales, retiros y dimensiones del lote."
            />
            <FeatureItem
              title="Transparencia Total"
              desc="Garantizamos datos fidedignos cruzando registros públicos."
            />
          </div>
        </div>

        <div className="lg:col-span-7 relative">
          <div className="aspect-video bg-urbik-g100 rounded-md overflow-hidden border border-urbik-g200 shadow-2xl relative group">
            <img
              src={image.src}
              alt="Visualización Catastral"
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-urbik-black/40 to-transparent pointer-events-none" />
          </div>
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-urbik-emerald/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-urbik-white2 border border-urbik-g200 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A2 2 0 013 15.487V6.707a2 2 0 011.553-1.954l8.944-4.472a2 2 0 011.106 0l8.944 4.472A2 2 0 0121 6.707v8.78a2 2 0 01-1.106 1.791L14.447 20a2 2 0 01-1.106 0l-4.341-2.17z"
          />
        </svg>
      </div>
      <div>
        <h4 className="font-bold text-urbik-dark">{title}</h4>
        <p className="text-sm text-urbik-muted font-medium">{desc}</p>
      </div>
    </div>
  );
}