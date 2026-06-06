import Link from "next/link";
import { Eye, Heart, Mail, MessageSquare } from "lucide-react";

type TopProperty = {
  id: string;
  title: string | null;
  image: string | null;
  views: number;
  favorites: number;
  inquiries: number;
  chats: number;
};

export default function TopPropertiesTable({ properties }: { properties: TopProperty[] }) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12 text-sm font-medium text-gray-500">
        Aún no hay propiedades con vistas registradas.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-md items-center justify-center uppercase text-urbik-black/50 font-bold border-b border-gray-200">
            <th className="px-4 py-3">Propiedad</th>
            <th className="px-3 py-3 text-right"><Eye size={20} className="inline mb-1 mr-1" /> Vistas</th>
            <th className="px-3 py-3 text-right"><Heart size={20} className="inline mb-1 mr-1" /> Favoritos</th>
            <th className="px-3 py-3 text-right"><Mail size={20} className="inline mb-1 mr-1" /> Consultas</th>
            <th className="px-3 py-3 text-right"><MessageSquare size={20} className="inline mb-1 mr-1" /> Chats</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-100">
          {properties.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
              <td className="px-4 py-3">
                <Link href={`/property/${p.id}`} className="flex items-center gap-3 min-w-0">
                  <div className="h-15 w-15 bg-gray-200 overflow-hidden shrink-0 opacity-50">
                    {p.image ? (
                      <img src={p.image} alt={p.title ?? ""} className="object-cover w-full h-full" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400 text-[10px] font-bold">URBIK</div>
                    )}
                  </div>
                  <span className="font-bold text-urbik-black/70 truncate max-w-[260px]">
                    {p.title ?? "Sin título"}
                  </span>
                </Link>
              </td>
              <td className="px-3 py-3 text-right font-black text-urbik-black/70">{p.views}</td>
              <td className="px-3 py-3 text-right font-bold text-urbik-black/60">{p.favorites}</td>
              <td className="px-3 py-3 text-right font-bold text-urbik-black/60">{p.inquiries}</td>
              <td className="px-3 py-3 text-right font-bold text-urbik-black/60">{p.chats}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
