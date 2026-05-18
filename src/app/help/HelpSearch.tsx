"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, Users, Scale, FileSearch } from "lucide-react";

interface Post {
  slug: string;
  title: string;
  category: string;
}

const CATEGORIES = [
  { name: "Inmobiliarias", slug: "realestates", icon: Building2 },
  { name: "Compradores o Inquilinos", slug: "buyers", icon: Users },
  { name: "Legales", slug: "legal", icon: Scale },
  { name: "Valoraciones", slug: "valuations", icon: FileSearch },
];

export default function HelpSearch({ initialPosts }: { initialPosts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const results = initialPosts.filter((art) =>
    art.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 pb-20 mt-13">
      <div className="mb-20"><Image src="/Urbik_Help_Logo.svg" alt="Logo" width={220} height={40} priority /></div>
      <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 text-center tracking-tight">¿Cómo podemos ayudarte?</h1>

      <div className="w-full max-w-3xl relative" ref={searchRef}>
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative grow">
            <input
              type="text"
              placeholder="Escribe tu pregunta aquí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="italic w-full h-14 pl-5 pr-12 border border-gray-300 rounded-full bg-urbik-white2 text-center placeholder:text-urbik-dark font-medium opacity-70 focus:ring-2 focus:ring-urbik-black outline-none transition-all"
            />
          </div>
        </div>

        {searchQuery !== "" && (
          <div className="absolute z-50 w-full mb-8 border border-gray-100 rounded-4xl p-2 shadow-xl bg-urbik-black">
            {results.length > 0 ? (
              results.map((art) => (
                <Link key={art.slug} href={`/help/${art.slug}`} className="flex items-center justify-between p-4 hover:bg-urbik-dark rounded-4xl group font-medium hover:font-bold">
                  <span className="text-urbik-white group-hover:text-white">{art.title}</span>
                  <span className="text-xs bg-urbik-emerald px-2 py-1 rounded text-urbik-black">{art.category}</span>
                </Link>
              ))
            ) : (
              <p className="p-4 text-center text-gray-400">No hay resultados.</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.slug} href={`/help/category/${cat.slug}`} className="flex items-center gap-4 p-2 text-center rounded-full bg-urbik-white border border-gray-200 hover:border-urbik-black transition-all group">
                <div className="bg-urbik-black p-2.5 rounded-full text-white group-hover:bg-urbik-emerald transition-colors"><Icon size={20} /></div>
                <span className="text-md font-bold text-urbik-black grow tracking-tight mr-5">{cat.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 pt-10 border-t border-gray-100 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold text-black mb-3 italic">Mandanos un mensaje.</h2>
          <p className="text-gray-600 mb-8 max-w-sm">Comentanos tus inquietudes y en breve te estaremos contestando.</p>
          <Link href="/contact" className="bg-urbik-black text-white hover:text-urbik-emerald font-bold py-4 px-10 rounded-full transition-all shadow-md active:scale-95">
            Contactanos
          </Link>
        </div>
      </div>
    </div>
  );
}