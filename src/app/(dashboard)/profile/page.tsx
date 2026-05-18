"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  Lock,
  UserPlus,
  Phone,
  Save,
  Globe,
  Link2,
  Copy,
  Check,
} from "lucide-react";

import MediaUploader from "@/components/profile/MediaUploader";
import LocationSelectors from "@/components/ui/LocationSelectors";
import {
  SecuritySection,
  DangerZone,
  PauseAccountZone,
} from "@/components/profile/AccountActions";

const inputBaseClasses =
  "italic w-full px-6 py-4 rounded-full bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium text-urbik-black placeholder:text-gray-400";

const textareaClasses =
  "w-full px-6 py-4 rounded-3xl bg-urbik-white border border-gray-300 focus:ring-2 focus:ring-urbik-black outline-none transition-all font-medium resize-none text-urbik-black";

type UserProfileData = {
  first_name: string | null;
  last_name: string | null;
};

type RealEstateData = {
  agency_name: string | null;
  slug: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  instagram: string | null;
  bio: string | null;
  province: string | null;
  city: string | null;
  street: string | null;
  logo_url: string | null;
  banner_url: string | null;
};

type ProfileData = {
  id: string;
  role: "USER" | "REALESTATE";
  phone: string | null;
  is_active: boolean;
  user_profiles?: UserProfileData[];
  real_estates?: RealEstateData[];
};

type FormState = {
  firstName: string;
  lastName: string;
  agencyName: string;
  slug: string;
  phone: string;
  address: string;
  website: string;
  instagram: string;
  bio: string;
  province: string;
  city: string;
  street: string;
  logoUrl: string;
  bannerUrl: string;
};

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    agencyName: "",
    slug: "",
    phone: "",
    address: "",
    website: "",
    instagram: "",
    bio: "",
    province: "",
    city: "",
    street: "",
    logoUrl: "",
    bannerUrl: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data: userProfile } = await supabase
        .from("profiles")
        .select(`
          *,
          user_profiles (*),
          real_estates (*),
          real_estate_licenses (*),
          real_estate_offices (*)
        `)
        .eq("id", userId)
        .single();

      if (userProfile) {
        const typedProfile = userProfile as ProfileData;

        setProfile(typedProfile);

        if (typedProfile.role === "USER") {
          setForm((prev) => ({
            ...prev,
            firstName:
              typedProfile.user_profiles?.[0]?.first_name || "",
            lastName:
              typedProfile.user_profiles?.[0]?.last_name || "",
            phone: typedProfile.phone || "",
          }));
        } else {
          const agency = typedProfile.real_estates?.[0];

          setForm((prev) => ({
            ...prev,
            agencyName: agency?.agency_name || "",
            slug: agency?.slug || "",
            phone: agency?.phone || "",
            address: agency?.address || "",
            website: agency?.website || "",
            instagram: agency?.instagram || "",
            bio: agency?.bio || "",
            province: agency?.province || "",
            city: agency?.city || "",
            street: agency?.street || "",
            logoUrl: agency?.logo_url || "",
            bannerUrl: agency?.banner_url || "",
          }));
        }
      }

      setStatus("authenticated");
    },
    [supabase]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setStatus("unauthenticated");
      }
    });
  }, [fetchProfile, supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    setSaving(true);
    setMessage("");

    try {
      if (profile.role === "USER") {
        await supabase.from("user_profiles").upsert({
          profile_id: profile.id,
          first_name: form.firstName,
          last_name: form.lastName,
        });
      } else {
        await supabase.from("real_estates").upsert({
          profile_id: profile.id,
          agency_name: form.agencyName,
          phone: form.phone,
          address: form.address,
          street: form.street,
          website: form.website,
          instagram: form.instagram,
          bio: form.bio,
          province: form.province,
          city: form.city,
          logo_url: form.logoUrl,
          banner_url: form.bannerUrl,
        });
      }

      setMessage("Perfil actualizado correctamente");
    } catch {
      setMessage("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!profile) return;

    const url = `${window.location.origin}/realestate/${profile.id}`;

    navigator.clipboard.writeText(url);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-urbik-white">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-urbik-white px-6">
        <div className="bg-urbik-g300 p-8 rounded-[3rem] text-center max-w-md">
          <Lock
            className="mx-auto mb-4 text-urbik-muted"
            size={48}
          />

          <h1 className="text-3xl font-display font-bold mb-4">
            Acceso Restringido
          </h1>

          <button
            onClick={() => router.push("/auth/login")}
            className="w-full py-4 bg-urbik-black text-white rounded-full font-bold"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isRealEstate = profile.role === "REALESTATE";

  return (
    <div className="bg-urbik-white min-h-screen pt-32 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-right text-5xl font-display font-bold text-urbik-black tracking-tighter">
            Mi{" "}
            <span className="italic font-black text-6xl">
              Perfil.
            </span>
          </h1>

          {message && (
            <div className="mt-6 p-4 bg-urbik-emerald/10 border border-urbik-emerald/20 text-urbik-emerald font-bold rounded-2xl flex items-center gap-3 w-fit ml-auto">
              <div className="w-2 h-2 bg-urbik-emerald rounded-full animate-pulse" />
              {message}
            </div>
          )}
        </motion.div>

        <div className="w-full max-w-5xl mx-auto space-y-10 mt-10">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 text-urbik-black p-8 md:p-12"
          >
            {isRealEstate && (
              <>
                <div className="space-y-2">
                  <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide flex items-center gap-2">
                    <Link2 size={14} />
                    URL de tu perfil
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-3 px-6 py-4 rounded-full bg-urbik-g200 border border-gray-300">
                      <Globe
                        size={16}
                        className="text-urbik-black opacity-40 shrink-0"
                      />

                      <span className="text-sm font-medium text-urbik-black truncate">
                        {`${window.location.origin}/realestate/${profile.id}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-5 py-4 rounded-full bg-urbik-black text-white text-sm font-bold hover:bg-urbik-emerald transition-colors shrink-0"
                    >
                      {copied ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}

                      {copied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-4xl border border-urbik-g200 shadow-sm overflow-hidden relative mb-4">
                  <div className="h-48 md:h-64 w-full bg-urbik-g50 relative">
                    <MediaUploader
                      variant="banner"
                      currentUrl={form.bannerUrl}
                      onImageChange={(url: string) =>
                        setForm((prev) => ({
                          ...prev,
                          bannerUrl: url,
                        }))
                      }
                      disabled={saving}
                    />
                  </div>

                  <div className="px-8 pb-6 relative">
                    <div className="relative -mt-16 mb-4 w-32 h-32 md:w-40 md:h-40 z-10">
                      <MediaUploader
                        variant="logo"
                        currentUrl={form.logoUrl}
                        onImageChange={(url: string) =>
                          setForm((prev) => ({
                            ...prev,
                            logoUrl: url,
                          }))
                        }
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
                    Nombre Comercial
                  </label>

                  <input
                    name="agencyName"
                    value={form.agencyName}
                    onChange={handleChange}
                    className={inputBaseClasses}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
                    Ubicación
                  </label>

                  <LocationSelectors
                    provinceValue={form.province}
                    cityValue={form.city}
                    onChange={(name, value) =>
                      setForm((prev) => ({
                        ...prev,
                        [name]: value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            {!isRealEstate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
                    Nombre
                  </label>

                  <div className="relative">
                    <UserPlus
                      className="absolute left-6 top-5 text-urbik-black opacity-40"
                      size={18}
                    />

                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className={`${inputBaseClasses} pl-14`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
                    Apellido
                  </label>

                  <div className="relative">
                    <UserPlus
                      className="absolute left-6 top-5 text-urbik-black opacity-40"
                      size={18}
                    />

                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className={`${inputBaseClasses} pl-14`}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
                Teléfono de Contacto
              </label>

              <div className="relative">
                <Phone
                  className="absolute left-6 top-5 text-urbik-black opacity-40"
                  size={18}
                />

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`${inputBaseClasses} pl-14`}
                  placeholder="+54 9 11 ..."
                />
              </div>
            </div>

            {isRealEstate && (
              <div className="space-y-2">
                <label className="mb-2 ml-10 text-xmd font-medium text-urbik-black opacity-40 tracking-wide">
                  Sobre nosotros
                </label>

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  className={textareaClasses}
                  placeholder="Contanos más sobre vos..."
                />
              </div>
            )}

            <div className="mt-4">
              <SecuritySection />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-5 bg-urbik-black text-white font-bold rounded-full flex items-center gap-3 shadow-xl hover:bg-urbik-emerald disabled:opacity-50"
              >
                {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}

                {!saving && <Save size={20} />}
              </button>
            </div>
          </form>

          {isRealEstate && (
            <div className={!profile.is_active ? "opacity-50" : ""}>
              <PauseAccountZone
                isPaused={!profile.is_active}
                userId={profile.id}
                onToggleSuccess={() => fetchProfile(profile.id)}
              />
            </div>
          )}

          <div className="pt-10">
            <DangerZone
              itemName={
                isRealEstate
                  ? form.agencyName
                  : form.firstName
              }
              userId={profile.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}