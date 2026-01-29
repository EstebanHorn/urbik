/*
Este componente se encarga de generar dinámicamente una página de visualización para
artículos de ayuda basándose en el parámetro slug recibido en la URL. El código localiza 
un archivo Markdown específico en el sistema de archivos del servidor, verifica su
existencia para evitar errores (lanzando un notFound si el archivo no existe) y utiliza
la librería gray-matter para extraer tanto los metadatos (como el título y la categoría)
como el cuerpo del contenido. Finalmente, renderiza una interfaz estructurada que incluye
un enlace de retorno, la información del encabezado del post y el contenido textual dentro
de un contenedor con estilos optimizados para lectura.
*/

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const contentDirectory = path.join(process.cwd(), 'content', 'help');
  const filePath = path.join(contentDirectory, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return notFound();
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return (
    <div className="max-w-3xl mx-auto py-20 px-4">
      <a href="/help" className="text-urbik-emerald font-semibold mb-8 inline-block">
        ← Volver al Centro de Ayuda
      </a>
      
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          {data.category}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-black mt-2">
          {data.title}
        </h1>
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">

        {content}
      </div>
    </div>
  );
}