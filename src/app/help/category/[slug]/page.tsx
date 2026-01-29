/*
Este componente define una página de categoría dinámica que
obtiene una lista de artículos de ayuda mediante una función asíncrona, mapea el
parámetro de la URL (slug) a un nombre legible en español a través de un objeto de
referencia y filtra el contenido para mostrar únicamente los artículos pertenecientes
a dicha categoría. En su interfaz, renderiza un enlace de retorno, un encabezado con
el nombre de la sección y una cuadrícula de tarjetas interactivas que enlazan a cada
artículo específico, incluyendo un mensaje de estado en caso de que la categoría no
contenga publicaciones disponibles.
*/

import { getAllHelpPosts } from "@/libs/getHelpData";
import Link from "next/link";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allPosts = await getAllHelpPosts();

  const reverseMap: Record<string, string> = {
    "realestates": "Inmobiliarias",
    "buyers": "Compradores o Inquilinos",
    "legal": "Legales",
    "valuations": "Valoraciones"
  };

  const nombreCategoria = reverseMap[slug];

  const postsFiltrados = allPosts.filter(
    (post) => post.categoria === nombreCategoria
  );

  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <Link href="/help" className="text-emerald-600 mb-8 inline-block font-medium">
        ← Volver al buscador
      </Link>
      
      <h1 className="text-4xl font-bold mb-10 text-black">
        Ayuda para: {nombreCategoria}
      </h1>

      <div className="grid gap-4">
        {postsFiltrados.length > 0 ? (
          postsFiltrados.map((post) => (
            <Link 
              key={post.slug} 
              href={`/help/${post.slug}`}
              className="p-6 border border-gray-100 rounded-2xl hover:border-emerald-500 transition-all shadow-sm hover:shadow-md bg-white group"
            >
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-emerald-600">
                {post.titulo}
              </h2>
              <p className="text-gray-500 mt-2">Leer artículo completo →</p>
            </Link>
          ))
        ) : (
          <p className="text-gray-400 italic">No hay artículos disponibles en esta categoría todavía.</p>
        )}
      </div>
    </div>
  );
}