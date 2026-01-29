/*
Este código define un componente de diseño (layout) para una página de registro que 
organiza el contenido en una estructura de tres columnas en pantallas grandes: una 
sección central blanca con scroll independiente para el formulario (children) y el
aviso de copyright, flanqueada por dos paneles laterales decorativos que muestran una
imagen de fondo simétrica. El diseño es responsivo, por lo que en dispositivos móviles
los paneles laterales se ocultan para otorgar todo el ancho de la pantalla al contenido
principal, utilizando Tailwind CSS para gestionar el estilo, las sombras y el
comportamiento visual.
*/

import registerBg from "../../../assets/register_bg.png";

export function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src={registerBg.src}
          alt="Background Left"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="w-full lg:w-1/3 flex flex-col items-center bg-white relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md pt-10">
          {children}
          
          <div className="mt-12 text-center text-gray-400 text-xs font-medium pb-8">
            © 2025 Urbik. Todos los derechos reservados.
          </div>
        </div>
      </div>

      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src={registerBg.src}
          alt="Background Right"
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>
    </div>
  );
}
