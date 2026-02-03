/*
Este componente de React, denominado PropertyTypeSelector, es un selector visual de tipos
de propiedad que renderiza una cuadrícula de botones interactivos basados en una lista
predefinida de opciones (Casa, Departamento, Terreno, etc.). Utiliza las propiedades value
para identificar la opción seleccionada actualmente y onChange para notificar al componente
padre cuando el usuario hace clic en una opción diferente. Estéticamente, emplea clases de 
Tailwind CSS para mostrar un diseño responsivo de dos columnas y aplica estilos condicionales
que resaltan el botón activo con un fondo negro y texto blanco, mientras que las opciones no
seleccionadas mantienen un estilo neutral con bordes grises y fondo blanco.
*/

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export function PropertyTypeSelector({ value, onChange }: Props) {
  const options = [
    { id: "HOUSE", label: "Casa" },
    { id: "APARTMENT", label: "Departamento" },
    { id: "LAND", label: "Lote / Terreno" },
    { id: "COMMERCIAL_PROPERTY", label: "Local Comercial" },
    { id: "OFFICE", label: "Oficina" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-full cursor-pointer px-4 py-3 font-bold text-sm border transition
            ${value === opt.id
              ? "bg-urbik-black text-white"
              : "bg-white border-gray-200 text-gray-600"}
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
