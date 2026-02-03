/*
Este hook personalizado de React, llamado useProfile, gestiona de manera integral la
lógica de negocio para el perfil de usuario en una aplicación de Next.js, encargándose
de obtener, sincronizar y actualizar la información según el rol del usuario (USER o
REALESTATE). Utiliza next-auth para validar la sesión y centraliza en un único estado
(form) tanto los datos personales como los de agencias inmobiliarias, ofreciendo
controladores para cambios manuales, carga de propiedades asociadas y una función de
envío que comunica los cambios con el servicio backend, facilitando así una interfaz
reactiva y coherente para la gestión del perfil.
*/

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { fetchProfileData, updateProfile } from "../service/profileService"; 
import { 
  UserRole, 
  FormState, 
  Property, 
  RealEstateFormFields, 
  UserFormFields 
} from "../../../libs/types";

interface UseProfileResult {
  userRole: UserRole;
  form: FormState;
  userProperties: Property[];
  loading: boolean;
  message: string;
  refetchData: () => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleManualChange: (name: string, value: any) => void; // Agregado para actualizar isActive
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const initialFormState: FormState = {
  firstName: "", 
  lastName: "", 
  phone: "", 
  name: "", 
  address: "", 
  website: "", 
  auth_provider: "",
  isActive: true,
  instagram: "", 
  bio: "",
  province: "",
  city: "",
  license: ""
};

export function useProfile(): UseProfileResult {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const refetchData = useCallback(async () => {
    if (status !== "authenticated") return; 
    setLoading(true);
    try {
      const data = await fetchProfileData();
      const role = data.role as UserRole;
      setUserRole(role);
      
      const provider = (session?.user as any)?.provider || "email";
      
      if (role === 'USER') {
        setForm({
          firstName: data.firstName || "", 
          lastName: data.lastName || "", 
          phone: data.phone || "", 
          isActive: data.isActive ?? true, 
          name: "", 
          address: "", 
          website: "",
          auth_provider: provider
        });
        setUserProperties(data.properties || []); 
} else if (role === 'REALESTATE' && data.agencyData) {
  setForm({
    phone: data.agencyData.phone || data.phone || "",
    name: data.agencyData.agencyName || "", 
    address: data.agencyData.address || "", 
    website: data.agencyData.website || "",
    instagram: data.agencyData.instagram || "", // Mapeo nuevo
    bio: data.agencyData.bio || "",             // Mapeo nuevo
    province: data.agencyData.province || "",   // Mapeo nuevo
    city: data.agencyData.city || "",           // Mapeo nuevo
    license: data.agencyData.license || "",     // Mapeo nuevo
    auth_provider: provider,
    isActive: data.isActive ?? true,
  });
        setUserProperties(data.agencyData.properties || []); 
      }
      setMessage(""); 
    } catch (error: any) {
      console.error("Error al cargar datos:", error);
      setMessage(`Error al cargar el perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [session?.user, status]); 

  useEffect(() => {
    if (status === "authenticated") {
      refetchData();
    }
  }, [status, refetchData]); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleManualChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === null) return;

    setLoading(true);
    setMessage("");

    try {
      let payload: RealEstateFormFields | UserFormFields;

if (userRole === 'REALESTATE') {
  payload = { 
    name: form.name, 
    address: form.address, 
    phone: form.phone, 
    website: form.website,
    instagram: form.instagram,
    bio: form.bio,            
    province: form.province,
    city: form.city
  } as RealEstateFormFields;
      } else {
        payload = { 
          firstName: form.firstName, 
          lastName: form.lastName, 
          phone: form.phone 
        } as UserFormFields;
      }
      
      await updateProfile(payload, userRole);
      setMessage("✅ Perfil actualizado correctamente");
      await refetchData(); 
    } catch (err: any) {
      console.error("Error al actualizar:", err);
      setMessage(`⚠️ ${err.message || "Error en la petición de actualización"}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    userRole,
    form,
    userProperties,
    loading,
    message,
    refetchData,
    handleChange,
    handleManualChange,
    handleSubmit
  };
}