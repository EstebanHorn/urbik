/*
Este código define un hook personalizado de React llamado useRegisterForm que gestiona
la lógica de un formulario de registro con dos perfiles de usuario (USER y REALESTATE).
El hook centraliza el estado de los campos, maneja los cambios en los inputs, controla
la apertura y el cierre automático de un menú desplegable para seleccionar el rol
(cerrándolo incluso si se hace clic fuera de él) y gestiona el envío de los datos a una
API mediante una petición POST, redirigiendo al usuario a la página principal si el
proceso es exitoso.
*/

import { useState, useRef, useEffect } from "react";

type Role = 'USER' | 'REALESTATE'; 

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

const navigateTo = (path: string) => {
  window.location.href = path;
};

export function useRegisterForm() {
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleSelection = (role: Role) => {
    setForm(prev => ({ ...prev, role }));
    setIsRoleDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/register", { 
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      });

      if (res.ok) {
        navigateTo("/");
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || "No se pudo registrar"}`);
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  return {
    form,
    dropdownRef,
    handleInputChange,
    handleRoleSelection,
    handleSubmit,
    setIsRoleDropdownOpen,
    isRoleDropdownOpen
  };
}