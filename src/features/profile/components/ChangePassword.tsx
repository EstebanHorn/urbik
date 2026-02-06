/*
Este código define un componente de React (Next.js) para una sección de seguridad que permite
a los usuarios cambiar su contraseña mediante un modal emergente. El componente gestiona un
formulario con validaciones internas para asegurar que las nuevas contraseñas coincidan, maneja
estados de carga y errores, y realiza una petición asíncrona de tipo PUT a una API interna para
actualizar la información.
*/
"use client";
import React, { useState } from "react";
import { Lock, Eye, EyeOff, X } from "lucide-react";

const SecuritySection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const inputBaseClasses =
    "w-full px-6 py-4 rounded-full bg-white border border-gray-300 focus:ring-2 focus:ring-black outline-none transition-all font-medium text-black";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "Las nuevas contraseñas no coinciden",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al actualizar");

      setMessage({
        type: "success",
        text: "¡Contraseña actualizada con éxito!",
      });
      setTimeout(() => setIsOpen(false), 2000);
    } catch (err: unknown) {
      let errorMsg = "Ocurrió un error inesperado";
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMsg = String((err as { message: unknown }).message);
      }
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-4xl border border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-black p-3 rounded-full text-white">
            <Lock size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Seguridad de la cuenta
            </h3>
            <p className="text-sm text-gray-500">
              Cambia tu contraseña periódicamente para protegerte
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 cursor-pointer bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all"
        >
          Cambiar Contraseña
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          {/* Corrección: rounded-[3rem] cambiado a rounded-4xl o personalizado si es necesario, aquí uso rounded-3xl para consistencia visual estándar o rounded-4xl */}
          <div className="bg-gray-50 w-full max-w-lg rounded-4xl p-8 md:p-12 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute cursor-pointer right-8 top-8 text-gray-400 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="bg-black p-2 rounded-full text-white">
                <Lock size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Actualizar Contraseña
              </h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="ml-4 text-xs font-bold text-black opacity-40 uppercase tracking-widest">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  required
                  className={inputBaseClasses}
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
              </div>

              <hr className="border-gray-200 my-2" />

              <div className="space-y-2 relative">
                <label className="ml-4 text-xs font-bold text-black opacity-40 uppercase tracking-widest">
                  Nueva Contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={inputBaseClasses}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-6 top-[3.2rem] text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="space-y-2">
                <label className="ml-4 text-xs font-bold text-black opacity-40 uppercase tracking-widest">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={inputBaseClasses}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Repetir contraseña"
                />
              </div>

              {message.text && (
                <p
                  className={`text-center text-sm font-bold ${message.type === "error" ? "text-red-500" : "text-green-600"}`}
                >
                  {message.text}
                </p>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all disabled:bg-gray-400"
                >
                  {loading ? "Procesando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SecuritySection;
