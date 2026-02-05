/*
Este código define un hook personalizado de React llamado useRegisterForm que gestiona
la lógica de un formulario de registro con dos perfiles de usuario (USER y REALESTATE).
Incluye la funcionalidad de Auto-Login tras un registro exitoso para mejorar la UX.
*/

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Role = "USER" | "REALESTATE";

interface RegistrationForm {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  license: string;
  phone: string;
  province: string;
  city: string;
  street: string;
  address: string;
}

export function useRegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<RegistrationForm>({
    name: "",
    lastName: "",
    email: "",
    password: "",
    role: "USER",
    license: "",
    phone: "",
    province: "",
    city: "",
    street: "",
    address: "",
  });

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelection = (role: Role) => {
    setForm((prev) => ({ ...prev, role }));
    setIsRoleDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      // 1. Petición de registro a la API
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // 2. LOGICA DE AUTO-LOGIN
        // Intentamos iniciar sesión automáticamente con las credenciales que el usuario acaba de crear
        const loginResult = await signIn("credentials", {
          redirect: false, // No redirigir automáticamente para manejar la lógica aquí
          email: form.email,
          password: form.password,
        });

        if (loginResult?.error) {
          // Si el registro fue exitoso pero el login falló (ej: cuenta REALESTATE requiere aprobación manual)
          console.error("Login error:", loginResult.error);
          alert(
            "Cuenta creada con éxito. Por favor, inicia sesión manualmente.",
          );
          router.push("/login");
        } else {
          // Login exitoso, redirigimos al inicio o dashboard
          router.push("/");
          router.refresh(); // Refrescar componentes de servidor para actualizar el estado de la sesión
        }
      } else {
        alert(`Error: ${data.error || "No se pudo registrar"}`);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Error de conexión al intentar procesar el registro.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    dropdownRef,
    handleInputChange,
    handleRoleSelection,
    handleSubmit,
    setIsRoleDropdownOpen,
    isRoleDropdownOpen,
    isLoading, // Exponemos el estado de carga para deshabilitar el botón en el componente
  };
}
