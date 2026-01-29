/*
Este código define un componente para la página de perfil de una aplicación que gestiona la
autenticación y la visualización condicional de formularios según el rol del usuario. Utiliza 
el hook useSession de Next-Auth para controlar el estado de acceso, mostrando un indicador de
carga mientras se verifica la sesión, una pantalla de "Acceso Restringido" con opción de login
si el usuario no está autenticado, y finalmente el contenido principal si el acceso es válido.
El componente delega la lógica de negocio y el manejo de datos al hook personalizado useProfile,
lo que le permite renderizar dinámicamente el formulario de inmobiliaria (RealEstateForm) o el de
usuario final (UserForm) basándose en el valor de userRole, todo ello integrado con animaciones de
Framer Motion y una interfaz estilizada con Tailwind CSS.
*/

"use client";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { UserFormFields, RealEstateFormFields } from "../../libs/types";
import { useProfile } from "../../features/profile/hooks/useProfile";
import UserForm from "../../features/profile/components/UserForm";
import RealEstateForm from "../../features/profile/components/RealEstateForm";
import { Loader2, Lock } from "lucide-react";

export default function Profile() {
  const { status } = useSession();
  const {
    userRole,
    form,
    userProperties,
    loading,
    message,
    refetchData,
    handleChange,
    handleManualChange,
    handleSubmit,
  } = useProfile();

  if (status === "loading" || userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-urbik-white">
        <Loader2 className="animate-spin text-urbik-black" size={40} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-urbik-white px-6">
        <div className="bg-urbik-g300 p-8 rounded-[3rem] text-center max-w-md">
          <Lock className="mx-auto mb-4 text-urbik-muted" size={48} />
          <h1 className="text-3xl font-display font-bold mb-4">Acceso Restringido</h1>
          <p className="text-urbik-muted font-medium mb-8">Debes iniciar sesión para gestionar tu perfil y propiedades.</p>
          <button
            onClick={() => signIn()}
            className="w-full py-4 bg-urbik-black text-white rounded-full font-bold hover:bg-urbik-emerald transition-all active:scale-95"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-urbik-white min-h-screen pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className=""
        >
          <h1 className="text-right mr-50 text-5xl font-display font-bold text-urbik-black tracking-tighter">
            Mi <span className="italic font-black text-6xl">Perfil.</span>
          </h1>
          {message && (
            <div className="mt-6 p-4 bg-urbik-emerald/10 border border-urbik-emerald/20 text-urbik-emerald font-bold rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-urbik-emerald rounded-full animate-pulse" />
              {message}
            </div>
          )}
        </motion.div>

        {userRole === "REALESTATE" ? (
          <div className=" lg:col-span-12 gap-12 items-start">
    <div className="lg:col-span-8 lg:col-start-3">
<RealEstateForm
    form={form as RealEstateFormFields & { auth_provider: string }}
    handleChange={handleChange}
    handleManualChange={handleManualChange}
    handleSubmit={handleSubmit}
    loading={loading}
/>
    </div>
  </div>
        ) : (
          <div className="max-w-full mx-auto">
            <UserForm
              form={form as UserFormFields & { auth_provider: string }}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
}