import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Role = "USER" | "REALESTATE";

export interface RegisterLicenseForm {
  licenseNumber: string;
  province: string;
  jurisdiction: string;
  responsibleName: string;
  isPrimary: boolean;
}

export interface RegisterOfficeForm {
  name: string;
  province: string;
  city: string;
  street: string;
  number: string;
  phone: string;
}

interface RegistrationForm {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  license: string;
  responsibleName: string;
  jurisdiction: string;
  phone: string;
  province: string;
  city: string;
  street: string;
  address: string;
  licenses: RegisterLicenseForm[];
  offices: RegisterOfficeForm[];
}

const EMPTY_LICENSE: RegisterLicenseForm = {
  licenseNumber: "",
  province: "",
  jurisdiction: "",
  responsibleName: "",
  isPrimary: true,
};

const EMPTY_OFFICE: RegisterOfficeForm = {
  name: "Casa central",
  province: "",
  city: "",
  street: "",
  number: "",
  phone: "",
};

export function useRegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [form, setForm] = useState<RegistrationForm>({
    name: "",
    lastName: "",
    email: "",
    password: "",
    role: "USER",
    license: "",
    responsibleName: "",
    jurisdiction: "",
    phone: "",
    province: "",
    city: "",
    street: "",
    address: "",
    licenses: [{ ...EMPTY_LICENSE }],
    offices: [{ ...EMPTY_OFFICE }],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "email") {
      setEmailError(null);
    }
  };

  const checkEmailAvailability = useCallback(async (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;

    setEmailChecking(true);
    setEmailError(null);

    try {
      const res = await fetch("/api/register/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data: { available?: boolean; error?: string } = await res.json();

      if (!data.available) {
        setEmailError("Este correo ya está registrado. ¿Querés iniciar sesión?");
      }
    } catch {
      // Non-critical: server-side will still validate
    } finally {
      setEmailChecking(false);
    }
  }, []);

  const handleRoleSelection = (role: Role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const updateLicense = (
    index: number,
    field: keyof RegisterLicenseForm,
    value: string | boolean,
  ) => {
    setForm((prev) => {
      const next = [...prev.licenses];
      next[index] = { ...next[index], [field]: value };
      if (field === "isPrimary" && value === true) {
        return {
          ...prev,
          licenses: next.map((item, i) => ({
            ...item,
            isPrimary: i === index,
          })),
        };
      }
      return { ...prev, licenses: next };
    });
  };

  const addLicense = () => {
    setForm((prev) => ({
      ...prev,
      licenses: [...prev.licenses, { ...EMPTY_LICENSE, isPrimary: false }],
    }));
  };

  const removeLicense = (index: number) => {
    setForm((prev) => {
      const next = prev.licenses.filter((_, i) => i !== index);
      if (next.length === 0) return prev;
      if (!next.some((item) => item.isPrimary)) {
        next[0].isPrimary = true;
      }
      return { ...prev, licenses: next };
    });
  };

  const updateOffice = (
    index: number,
    field: keyof RegisterOfficeForm,
    value: string,
  ) => {
    setForm((prev) => {
      const next = [...prev.offices];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, offices: next };
    });
  };

  const addOffice = () => {
    setForm((prev) => ({
      ...prev,
      offices: [...prev.offices, { ...EMPTY_OFFICE, name: "Sucursal" }],
    }));
  };

  const removeOffice = (index: number) => {
    setForm((prev) => {
      const next = prev.offices.filter((_, i) => i !== index);
      return { ...prev, offices: next.length > 0 ? next : prev.offices };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Block submit if email is already taken
    if (emailError) return;

    setIsLoading(true);

    try {
      const normalizedLicenses = form.licenses
        .map((item) => ({
          ...item,
          licenseNumber: item.licenseNumber.trim(),
          province: item.province.trim(),
          jurisdiction: item.jurisdiction.trim(),
          responsibleName: item.responsibleName.trim(),
        }))
        .filter(
          (item) =>
            item.licenseNumber && item.province && item.responsibleName,
        );

      const normalizedOffices = form.offices
        .map((item) => ({
          ...item,
          name: item.name.trim(),
          province: item.province.trim(),
          city: item.city.trim(),
          street: item.street.trim(),
          number: item.number.trim(),
          phone: item.phone.trim(),
        }))
        .filter(
          (item) =>
            item.name && item.province && item.city && item.street && item.number,
        );

      const primaryLicense =
        normalizedLicenses.find((item) => item.isPrimary) || normalizedLicenses[0];

      const payload = {
        ...form,
        license: primaryLicense?.licenseNumber || form.license,
        responsibleName: primaryLicense?.responsibleName || form.responsibleName,
        jurisdiction: primaryLicense?.jurisdiction || form.jurisdiction,
        licenses: normalizedLicenses,
        offices: normalizedOffices,
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const loginResult = await signIn("credentials", {
          redirect: false,
          email: form.email,
          password: form.password,
        });

        if (loginResult?.error) {
          alert("Cuenta creada con exito. Inicia sesion manualmente.");
          router.push("/login");
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        alert(`Error: ${data.error || "No se pudo registrar"}`);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Error de conexion al intentar procesar el registro.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    handleInputChange,
    handleRoleSelection,
    handleSubmit,
    isLoading,
    emailError,
    emailChecking,
    checkEmailAvailability,
    updateLicense,
    addLicense,
    removeLicense,
    updateOffice,
    addOffice,
    removeOffice,
  };
}

