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
  Role as UserRole,
  FormState,
  Property,
  RealEstateFormFields,
  UserFormFields,
} from "../../../libs/types";

interface UserWithProvider {
  provider?: string;
  [key: string]: unknown;
}

interface UseProfileResult {
  userRole: UserRole | null;
  form: FormState;
  userProperties: Property[];
  loading: boolean;
  message: string;
  refetchData: () => Promise<void>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleManualChange: (
    name: string,
    value: string | boolean | number | null,
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  agencyName: "",
  address: "",
  street: "",
  website: "",
  auth_provider: "",
  isActive: true,
  instagram: "",
  bio: "",
  province: "",
  city: "",
  license: "",
  logoUrl: "",
  bannerUrl: "",
};

export function useProfile(): UseProfileResult {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
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

      const user = session?.user as UserWithProvider;
      const provider = user?.provider || "email";

      if (role === "USER") {
        setForm((prev) => ({
          ...prev,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          isActive: data.isActive ?? true,
          auth_provider: provider,
        }));
        setUserProperties(data.properties || []);
      } else if (role === "REALESTATE" && data.agencyData) {
        setForm((prev) => ({
          ...prev,
          phone: data.agencyData.phone || data.phone || "",
          agencyName: data.agencyData.agencyName || "",
          address: data.agencyData.address || "",
          website: data.agencyData.website || "",
          instagram: data.agencyData.instagram || "",
          bio: data.agencyData.bio || "",
          province: data.agencyData.province || "",
          city: data.agencyData.city || "",
          license: data.agencyData.license || "",
          auth_provider: provider,
          isActive: data.isActive ?? true,
        }));
        setUserProperties(data.agencyData.properties || []);
      }
      setMessage("");
    } catch (error: unknown) {
      console.error("Error al cargar datos:", error);
      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessage(`Error al cargar el perfil: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [session?.user, status]);

  useEffect(() => {
    if (status === "authenticated") {
      refetchData();
    }
  }, [status, refetchData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleManualChange = (
    name: string,
    value: string | boolean | number | null,
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === null) return;

    setLoading(true);
    setMessage("");

    try {
      let payload: RealEstateFormFields | UserFormFields;

      if (userRole === "REALESTATE") {
        const rePayload: RealEstateFormFields = {
          agencyName: form.agencyName,
          address: form.address,
          phone: form.phone,
          website: form.website,
          instagram: form.instagram,
          bio: form.bio,
          province: form.province,
          city: form.city,
          license: form.license,
          isActive: form.isActive,
        };
        payload = rePayload;
      } else {
        const userPayload: UserFormFields = {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          isActive: form.isActive,
        };
        payload = userPayload;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateProfile(payload as any, userRole as any);

      setMessage("Perfil actualizado correctamente");
      await refetchData();
    } catch (err: unknown) {
      console.error("Error al actualizar:", err);
      let errorMsg = "Error en la petición de actualización";
      if (err instanceof Error) {
        errorMsg = err.message;
      }
      setMessage(` ${errorMsg}`);
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
    handleSubmit,
  };
}
