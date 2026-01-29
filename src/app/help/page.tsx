/*
Este fragmento de código define un componente de servidor llamado HelpPage que
actúa como el punto de entrada para la página de ayuda, encargándose de obtener
la totalidad de las publicaciones mediante la función getAllHelpPosts e inyectarlas
como estado inicial en el componente de cliente HelpClient. Su estructura facilita
la hidratación de datos desde el lado del servidor hacia el cliente, permitiendo
que la interfaz de usuario contenida en el elemento principal (<main>) reciba y
gestione la lista de posts de manera dinámica y eficiente.
*/

import { getAllHelpPosts } from "@/libs/getHelpData";
import HelpClient from "./HelpClient";

export default function HelpPage() {
  const posts = getAllHelpPosts();

  return (
    <main>
      <HelpClient initialPosts={posts} />
    </main>
  );
}