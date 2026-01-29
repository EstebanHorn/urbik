/*
Contiene funciones de utilidad para leer y procesar archivos Markdown desde 
el sistema de archivos local (content/help). Utiliza gray-matter para extraer 
la metadata de los archivos y transformarlos en objetos de datos listos para 
ser usados en la sección de ayuda.
*/

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content/help');

export function getAllHelpPosts() {
  const fileNames = fs.readdirSync(contentDirectory);
  
  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(contentDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    return {
      slug,
      titulo: data.title,
      categoria: data.category,
    };
  });

  return allPostsData;
}