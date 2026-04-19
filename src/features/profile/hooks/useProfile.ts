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

type LicenseFormItem = {
  id?: number;
  licenseNumber: string;
  province: string;
  jurisdiction?: string;
  responsibleName: string;
  isPrimary?: boolean;
};

type OfficeFormItem = {
  id?: number;
  name: string;
  province: string;
  city: string;
  street: string;
  number: string;
  phone?: string;
};

interface ProfileFormState extends FormState {
  licenses?: LicenseFormItem[];
  offices?: OfficeFormItem[];
}

interface UseProfileResult {
  userRole: UserRole | null;
  form: ProfileFormState;
  userProperties: Property[];
  loading: boolean;
  message: string;
  hasLoadedProfile: boolean;
  refetchData: () => Promise<void>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleManualChange: (
    name: string,
    value: string | boolean | number | null | LicenseFormItem[] | OfficeFormItem[],
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const initialFormState: ProfileFormState = {
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
  licenses: [],
  offices: [],
};

export function useProfile(): UseProfileResult {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState<ProfileFormState>(initialFormState);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  const refetchData = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    setMessage("");

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Tiempo de espera agotado")), 12000);
    });

    try {
      const data = (await Promise.race([
        fetchProfileData(),
        timeoutPromise,
      ])) as Record<string, unknown>;

      const role = data.role as UserRole;
      setUserRole(role);

      const user = session?.user as UserWithProvider;
      const provider = user?.provider || "email";

      if (role === "USER") {
        setForm((prev) => ({
          ...prev,
          firstName: (data.firstName as string) || "",
          lastName: (data.lastName as string) || "",
          phone: (data.phone as string) || "",
          isActive: (data.isActive as boolean) ?? true,
          auth_provider: provider,
        }));
        setUserProperties((data.properties as Property[]) || []);
      } else if (role === "REALESTATE" && data.agencyData) {
        const agencyData = data.agencyData as Record<string, unknown>;
        const licenses = (agencyData.licenses as LicenseFormItem[]) || [];
        const offices = (agencyData.offices as OfficeFormItem[]) || [];

        setForm((prev) => ({
          ...prev,
          phone: (agencyData.phone as string) || ((data.phone as string) || ""),
          agencyName: (agencyData.agencyName as string) || "",
          address: (agencyData.address as string) || "",
          website: (agencyData.website as string) || "",
          instagram: (agencyData.instagram as string) || "",
          bio: (agencyData.bio as string) || "",
          province: (agencyData.province as string) || "",
          city: (agencyData.city as string) || "",
          license:
            licenses.find((item) => item.isPrimary)?.licenseNumber ||
            (agencyData.license as string) ||
            "",
          licenses,
          offices,
          auth_provider: provider,
          isActive: (data.isActive as boolean) ?? true,
        }));
        setUserProperties((agencyData.properties as Property[]) || []);
      }
      setHasLoadedProfile(true);
    } catch (error: unknown) {
      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessage(`Error al cargar el perfil: ${errorMessage}`);
      setHasLoadedProfile(true);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      refetchData();
      return;
    }

    if (status === "unauthenticated") {
      setHasLoadedProfile(true);
      setUserRole(null);
    }
  }, [status, refetchData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleManualChange = (
    name: string,
    value: string | boolean | number | null | LicenseFormItem[] | OfficeFormItem[],
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
          licenses: form.licenses,
          offices: form.offices,
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

      await updateProfile(payload, userRole as "USER" | "REALESTATE");

      setMessage("Perfil actualizado correctamente");
      await refetchData();
    } catch (err: unknown) {
      let errorMsg = "Error en la peticion de actualizacion";
      if (err instanceof Error) {
        errorMsg = err.message;
      }
      setMessage(errorMsg);
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
    hasLoadedProfile,
    refetchData,
    handleChange,
    handleManualChange,
    handleSubmit,
  };
}

