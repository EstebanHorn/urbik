"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import AdminActions from "@/components/administrate/AdminActions";
import {
  MapPin, Maximize2, BedDouble, Bath, Hash, ChevronLeft, Building2,
  Phone, Mail, Car, CheckCircle2, XCircle, Layers, Flame,
  Waves, Wifi, Zap, Droplets, ShieldCheck, Trees, Snowflake,
  CalendarDays, Star, FlipVertical, Home, X, ExternalLink
} from "lucide-react";
import FavoriteButton from "@/components/ui/FavoriteButton";
import ImageGallery from "@/components/property/ImageGallery";
import InquiryForm from "@/components/property/InquiryForm";
import StartChatButton from "@/components/chat/StartChatButton";
import TrackPropertyView from "@/components/analytics/TrackPropertyView";

const getOperationLabel = (type: string) => {
  switch (type) {
    case "SALE": return "Venta";
    case "RENT": return "Alquiler";
    case "TEMP_RENT": return "Temporal";
    case "SALE_RENT": return "Venta y Alquiler";
    default: return type;
  }
};

const getPropertyLabel = (type: string) => {
  switch (type) {
    case "HOUSE": return "Casa";
    case "APARTMENT": return "Departamento";
    case "PH": return "PH";
    case "COUNTRY": return "Country";
    case "LAND": return "Terreno";
    case "FIELD": return "Campo";
    case "COMMERCIAL_PROPERTY": return "Local Comercial";
    case "OFFICE": return "Oficina";
    case "WAREHOUSE": return "Depósito";
    default: return type;
  }
};

const AMENITY_CATEGORIES = [
  {
    key: "ambientes",
    label: "Ambientes / Espacios",
    visibleFor: ["HOUSE", "APARTMENT", "PH", "OFFICE"],
    tags: [
      { key: "hasLiving", label: "Living" },
      { key: "hasLivingDining", label: "Living-comedor" },
      { key: "hasDining", label: "Comedor" },
      { key: "hasKitchen", label: "Cocina" },
      { key: "hasKitchenDining", label: "Cocina-comedor" },
      { key: "hasIntegratedKitchen", label: "Cocina integrada" },
      { key: "hasPantry", label: "Despensa" },
      { key: "hasSuite", label: "Suite" },
      { key: "hasWalkInCloset", label: "Vestidor" },
      { key: "hasStudy", label: "Escritorio" },
      { key: "hasPlayroom", label: "Playroom" },
      { key: "hasServiceRoom", label: "Cuarto de servicio" },
      { key: "hasStorage", label: "Depósito" },
      { key: "hasAttic", label: "Altillo" },
      { key: "hasBasement", label: "Subsuelo" },
    ],
  },
  {
    key: "exterior",
    label: "Exterior",
    visibleFor: ["HOUSE", "APARTMENT", "PH"],
    tags: [
      { key: "hasPatio", label: "Patio" },
      { key: "hasTerrace", label: "Terraza" },
      { key: "hasBalcony", label: "Balcón" },
      { key: "hasGarden", label: "Jardín" },
      { key: "hasGallery", label: "Galería" },
      { key: "hasGrill", label: "Parrilla" },
      { key: "hasSolarium", label: "Solárium" },
    ],
  },
  {
    key: "servicios",
    label: "Servicios",
    visibleFor: [],
    tags: [
      { key: "hasWater", label: "Agua corriente" },
      { key: "hasGas", label: "Gas natural" },
      { key: "hasGasBottle", label: "Gas en garrafa" },
      { key: "hasElectricity", label: "Luz eléctrica" },
      { key: "hasSewage", label: "Cloacas" },
      { key: "hasInternet", label: "Internet" },
      { key: "hasCable", label: "TV por cable" },
      { key: "hasPhone", label: "Teléfono" },
    ],
  },
];

const LEGACY_ICON: Record<string, React.ReactNode> = {
  hasElectricity: <Zap size={14} />,
  hasGas: <Flame size={14} />,
  hasInternet: <Wifi size={14} />,
  hasParking: <Car size={14} />,
  hasPool: <Waves size={14} />,
  hasWater: <Droplets size={14} />,
  aire: <Snowflake size={14} />,
  jardin: <Trees size={14} />,
  seguridad: <ShieldCheck size={14} />,
};

interface Property {
  id: string; title: string; description: string | null; address: string; city: string; province: string;
  neighborhood: string | null; locality: string | null; status: string; type: string; operationType: string;
  salePrice: number | null; rentPrice: number | null; saleCurrency: string; rentCurrency: string; expenses: number | null;
  isPriceHidden: boolean; area: number | null; coveredArea: number | null; semiCoveredArea: number | null;
  uncoveredArea: number | null; frontLength: number | null; backLength: number | null; rooms: number | null;
  bedrooms: number | null; bathrooms: number | null; toilets: number | null; garages: number | null;
  plants: number | null; floor: string | null; unitNumber: string | null; condition: string | null;
  constructionYear: number | null; latitude: number | null; longitude: number | null;
  parcelGeom: Record<string, unknown> | null; realEstateId: string | null; images: string[];
  isFavorite: boolean; legacyAmenities: Record<string, boolean>; featureGroups: Record<string, Record<string, boolean>>;
  RealEstate: { agencyName: string; phone: string } | null;
}

interface FormattedOtherProperty {
  id: string; title: string; type: string; operationType: string; salePrice: number | null;
  rentPrice: number | null; currency: string; city: string; province: string; images: string[]; isFavorite: boolean;
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-urbik-g100 rounded-2xl px-4 py-3 shadow-sm">
      <span className="text-urbik-black bg-urbik-g100 p-2 rounded-full shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-urbik-muted leading-none mb-0.5">{label}</p>
        <p className="text-base font-black text-urbik-black leading-tight">{value}</p>
      </div>
    </div>
  );
}

function SurfaceRow({ label, value }: { label: string; value: number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-urbik-g100 last:border-0">
      <span className="text-sm font-semibold text-urbik-muted">{label}</span>
      <span className="text-sm font-black text-urbik-black">{value} m²</span>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-urbik-muted shrink-0">{icon}</span>
      <span className="text-sm font-semibold text-urbik-muted flex-1">{label}</span>
      <span className="text-sm font-black text-urbik-black">{value}</span>
    </div>
  );
}

function FeaturesSection({ propertyType, legacyAmenities, featureGroups }: { propertyType: string; legacyAmenities: Record<string, boolean>; featureGroups: Record<string, Record<string, boolean>> }) {
  const flat: Record<string, boolean> = { ...legacyAmenities };
  for (const group of Object.values(featureGroups)) { if (group && typeof group === "object") { Object.assign(flat, group); } }
  for (const [k, v] of Object.entries(featureGroups)) { if (typeof v === "boolean") flat[k] = v; }

  const visibleCats = AMENITY_CATEGORIES.filter((cat) => cat.visibleFor.length === 0 || cat.visibleFor.includes(propertyType));
  const catsWithData = visibleCats.filter((cat) => cat.tags.some((t) => flat[t.key] === true || flat[t.key] === false));
  const catsToShow = visibleCats.length > 0 ? visibleCats.filter((cat) => cat.key === "servicios" || cat.tags.some((t) => flat[t.key] === true)) : [];

  if (catsToShow.length === 0 && catsWithData.length === 0) {
    const legacyActive = Object.entries(legacyAmenities).filter(([, v]) => v);
    if (legacyActive.length === 0) return null;
    return (
      <div className="mt-10">
        <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight ml-2 mb-4">Servicios y Comodidades</h3>
        <div className="flex flex-wrap gap-2">
          {legacyActive.map(([key]) => (
            <span key={key} className="inline-flex items-center gap-2 px-3 py-2 bg-urbik-black text-white text-xs font-bold rounded-full">
              {LEGACY_ICON[key] ?? <CheckCircle2 size={14} />}
              {key.replace("has", "").replace(/([A-Z])/g, " $1").trim()}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const showCats = catsToShow.length > 0 ? catsToShow : visibleCats.slice(0, 1);

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight ml-2 mb-6">Características y Servicios</h3>
      <div className="space-y-5">
        {showCats.map((cat) => {
          const hasSomething = cat.tags.some((t) => flat[t.key] !== undefined);
          if (!hasSomething && cat.key !== "servicios") return null;
          return (
            <div key={cat.key}>
              <p className="text-[11px] font-black uppercase tracking-widest text-urbik-muted mb-2 ml-1">{cat.label}</p>
              <div className="flex flex-wrap gap-2">
                {cat.tags.map((tag) => {
                  const isTrue = flat[tag.key] === true;
                  const isDefined = flat[tag.key] !== undefined;
                  if (!isTrue && !isDefined) { if (cat.key !== "servicios") return null; }
                  return (
                    <span key={tag.key} className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-full border transition-colors ${isTrue ? "bg-urbik-black text-white border-urbik-black" : "bg-white text-urbik-muted border-urbik-g200"}`}>
                      {isTrue ? <CheckCircle2 size={13} className="shrink-0" /> : <XCircle size={13} className="shrink-0 opacity-40" />}
                      {tag.label}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const getStatusBadge = (property: { status?: string; operationType: string }) => {
  const s = property.status || "AVAILABLE";
  if (s === "SOLD") return { label: "VENDIDA", color: "bg-urbik-white2 text-urbik-dark" };
  if (s === "RENTED") return { label: "ALQUILADA", color: "bg-urbik-white2 text-urbik-dark" };
  if (s === "PAUSED") return { label: "PAUSADA", color: "bg-urbik-white2 text-urbik-dark" };
  return { label: getOperationLabel(property.operationType), color: "bg-urbik-white2 text-urbik-dark" };
};

export default function PropertySlidePanel({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const [data, setData] = useState<{ property: Property; otherProperties: FormattedOtherProperty[]; isAdmin: boolean; userId: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      let isAdmin = false;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        isAdmin = profile?.role === "ADMIN";
      }

      const { data: propRaw, error } = await supabase.from("properties").select(`*, real_estates (agency_name, phone)`).eq("id", propertyId).single();
      
      if (error || !propRaw) {
        setLoading(false);
        return;
      }

      let isFavorite = false;
      if (userId) {
        const { count } = await supabase.from("favorites").select("*", { count: "exact", head: true }).eq("property_id", propertyId).eq("profile_id", userId);
        isFavorite = (count || 0) > 0;
      }

      let otherProperties: FormattedOtherProperty[] = [];
      if (propRaw.real_estate_id) {
        const { data: othersRaw } = await supabase.from("properties").select("id, title, type, operation_type, sale_price, rent_price, sale_currency, rent_currency, city, province, images").eq("real_estate_id", propRaw.real_estate_id).eq("status", "AVAILABLE").neq("id", propertyId).limit(4);
        if (othersRaw) {
          if (userId) {
            const otherIds = othersRaw.map((p) => p.id);
            const { data: favs } = await supabase.from("favorites").select("property_id").eq("profile_id", userId).in("property_id", otherIds);
            const favSet = new Set(favs?.map((f) => f.property_id));
            otherProperties = othersRaw.map((p) => ({ id: p.id, title: p.title, type: p.type, operationType: p.operation_type, salePrice: p.sale_price, rentPrice: p.rent_price, currency: p.sale_currency || p.rent_currency || "USD", city: p.city, province: p.province, images: p.images || [], isFavorite: favSet.has(p.id) }));
          } else {
            otherProperties = othersRaw.map((p) => ({ id: p.id, title: p.title, type: p.type, operationType: p.operation_type, salePrice: p.sale_price, rentPrice: p.rent_price, currency: p.sale_currency || p.rent_currency || "USD", city: p.city, province: p.province, images: p.images || [], isFavorite: false }));
          }
        }
      }

      const featureGroups = (propRaw.feature_groups && typeof propRaw.feature_groups === "object") ? propRaw.feature_groups : {};

      const property: Property = {
        id: propRaw.id, title: propRaw.title, description: propRaw.description, address: propRaw.address, city: propRaw.city, province: propRaw.province,
        neighborhood: propRaw.neighborhood || null, locality: propRaw.locality || null, status: propRaw.status, type: propRaw.type, operationType: propRaw.operation_type,
        salePrice: propRaw.sale_price, rentPrice: propRaw.rent_price, saleCurrency: propRaw.sale_currency || "USD", rentCurrency: propRaw.rent_currency || "ARS", expenses: propRaw.expenses,
        isPriceHidden: Boolean(propRaw.is_price_hidden), area: propRaw.area, coveredArea: propRaw.covered_area, semiCoveredArea: propRaw.semi_covered_area,
        uncoveredArea: propRaw.uncovered_area, frontLength: propRaw.front_length, backLength: propRaw.back_length, rooms: propRaw.rooms,
        bedrooms: propRaw.bedrooms, bathrooms: propRaw.bathrooms, toilets: propRaw.toilets, garages: propRaw.garages, plants: propRaw.plants, floor: propRaw.floor, unitNumber: propRaw.unit_number, condition: propRaw.condition,
        constructionYear: propRaw.construction_year, latitude: propRaw.latitude, longitude: propRaw.longitude, parcelGeom: propRaw.parcel_geom, realEstateId: propRaw.real_estate_id, images: propRaw.images || [], isFavorite,
        legacyAmenities: { hasElectricity: Boolean(propRaw.has_electricity), hasGas: Boolean(propRaw.has_gas), hasInternet: Boolean(propRaw.has_internet), hasParking: Boolean(propRaw.has_parking), hasPool: Boolean(propRaw.has_pool), hasWater: Boolean(propRaw.has_water) }, featureGroups,
        RealEstate: propRaw.real_estates ? { agencyName: propRaw.real_estates.agency_name, phone: propRaw.real_estates.phone } : null,
      };

      setData({ property, otherProperties, isAdmin, userId });
      setLoading(false);
    };

    if (propertyId) fetchPropertyData();
  }, [propertyId, supabase]);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-urbik-black"></div>
      </div>
    );
  }

  const { property, otherProperties, isAdmin, userId } = data;
  const formatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });
  const statusBadge = getStatusBadge(property);
  const isBoth = property.operationType === "SALE_RENT";

  const statChips = [
    property.rooms && { icon: <Home size={16} />, label: "Ambientes", value: property.rooms },
    property.bedrooms && { icon: <BedDouble size={16} />, label: "Dormitorios", value: property.bedrooms },
    property.bathrooms && { icon: <Bath size={16} />, label: "Baños", value: property.bathrooms },
    property.toilets && { icon: <Bath size={16} />, label: "Toilettes", value: property.toilets },
    property.garages && { icon: <Car size={16} />, label: "Cocheras", value: property.garages },
    property.plants && { icon: <Layers size={16} />, label: "Plantas", value: property.plants },
    property.area && { icon: <Maximize2 size={16} />, label: "Sup. cubierta", value: `${property.area} m²` },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string | number }[];

  const detailRows = [
    property.type && { icon: <Building2 size={16} />, label: "Tipo", value: getPropertyLabel(property.type) },
    property.floor && { icon: <Layers size={16} />, label: "Piso", value: property.floor },
    property.unitNumber && { icon: <Hash size={16} />, label: "Unidad", value: property.unitNumber },
    property.condition && { icon: <Star size={16} />, label: "Estado del inmueble", value: property.condition.charAt(0).toUpperCase() + property.condition.slice(1) },
    property.constructionYear && { icon: <CalendarDays size={16} />, label: "Año de construcción", value: property.constructionYear },
    property.frontLength && { icon: <FlipVertical size={16} />, label: "Frente", value: `${property.frontLength} m` },
    property.backLength && { icon: <FlipVertical size={16} />, label: "Fondo", value: `${property.backLength} m` },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string | number }[];

  const hasSurfaceBreakdown = property.coveredArea || property.semiCoveredArea || property.uncoveredArea;

  return (
    <div className="relative min-h-full bg-white pb-32 lg:pb-20">
      <TrackPropertyView propertyId={String(property.id)} />
      
      <div className="sticky top-15 z-50 flex items-center justify-between px-10 py-4">
        <Link
          href={`/property/${property.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer flex items-center gap-2 rounded-full bg-urbik-white2 px-4 py-2 text-xs font-bold uppercase  text-urbik-black/80 hover:bg-urbik-g200 transition-colors"
        >
          <ExternalLink size={14} /> Abrir en nueva pestaña
        </Link>
        <button
          onClick={onClose}
          className="cursor-pointer rounded-full bg-urbik-white2 p-2 text-urbik-black/80 hover:bg-urbik-g200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto  -mb-15">
        <ImageGallery
          images={property.images}
          title={property.title}
          parcelGeom={property.parcelGeom}
          latitude={property.latitude}
          longitude={property.longitude}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-2 sm:gap-3 px-5 mb-10 sm:mb-20">
          <div className="space-y-2 w-full lg:w-auto">
            <h1 className="text-3xl md:text-4xl lg:text-4xl font-display font-black text-urbik-black italic tracking-tighter leading-tight">
              {property.title}
            </h1>
            <div className="flex justify-end items-center gap-2 text-urbik-muted font-medium italic">
              <MapPin size={16} className="text-urbik-black/60 shrink-0 sm:w-5 sm:h-5" />
              <span className="text-urbik-black/60 sm:text-lg">
                {property.address}{property.neighborhood ? `, ${property.neighborhood}` : ""}, {property.city}
                {property.locality && property.locality !== property.city ? ` (${property.locality})` : ""}
              </span>
            </div>
          </div>

          {!property.isPriceHidden && (
            <div className="lg:text-right w-full lg:w-auto">
              <div className={`flex flex-col ${isBoth ? "gap-2" : ""}`}>
                <div className="flex flex-wrap justify-end items-center gap-3 mb-2 z-100">
                  <span className="bg-urbik-black text-urbik-white text-xs font-black uppercase tracking-wider border border-urbik-g100 px-4 py-2 rounded-full">
                    {getPropertyLabel(property.type)}
                  </span>
                  <span className={`text-xs font-black uppercase px-4 py-2 rounded-full tracking-wider shadow-sm ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                  <FavoriteButton propertyId={property.id} initialIsFavorite={property.isFavorite} />
                </div>
                {(property.operationType === "SALE" || isBoth) && property.salePrice && (
                  <div className="flex flex-col lg:items-end">
                    {isBoth && <span className="text-xs font-black text-urbik-muted uppercase tracking-widest mb-1">Venta</span>}
                    <div className={`${isBoth ? "text-3xl" : "text-4xl sm:text-5xl md:text-5xl"} font-display font-bold tracking-tighter flex items-baseline`}>
                      <span className="text-urbik-black/30 mr-2 font-black text-0.5em">{property.saleCurrency}</span>
                      <span className="text-urbik-black">${formatter.format(property.salePrice)}</span>
                    </div>
                    {property.expenses && (
                      <p className="text-sm font-bold text-urbik-muted lg:text-right mt-1">
                        + Expensas: {property.saleCurrency} {formatter.format(property.expenses)}
                      </p>
                    )}
                  </div>
                )}
                {(property.operationType === "RENT" || property.operationType === "TEMP_RENT" || isBoth) && property.rentPrice && (
                  <div className="flex flex-col lg:items-end">
                    {isBoth && <span className="text-xs font-black text-urbik-muted uppercase tracking-widest mb-1 mt-2">Alquiler</span>}
                    <div className={`${isBoth ? "text-3xl" : "text-4xl sm:text-5xl md:text-7xl"} font-display font-bold tracking-tighter flex items-baseline`}>
                      <span className="text-urbik-black/30 mr-2 font-black text-0.5em">{property.rentCurrency}</span>
                      <span className="text-urbik-black">{formatter.format(property.rentPrice)}</span>
                    </div>
                    {property.expenses && (
                      <p className="text-sm font-bold text-urbik-muted lg:text-right mt-1">
                        + Expensas: {property.rentCurrency} {formatter.format(property.expenses)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          {property.isPriceHidden && (
            <div className="lg:text-right">
              <p className="text-4xl font-black text-urbik-muted italic">Consultar precio</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 mt-8 sm:mt-12">
          <div className="lg:col-span-8 space-y-10">
            {statChips.length > 0 && (
              <div>
                <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight mb-4 ml-2">Resumen</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {statChips.map((chip, i) => (
                    <StatChip key={i} icon={chip.icon} label={chip.label} value={chip.value} />
                  ))}
                </div>
              </div>
            )}

            {hasSurfaceBreakdown && (
              <div>
                <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight mb-4 ml-2">Superficies</h3>
                <div className="bg-white border border-urbik-g100 rounded-2xl px-6 py-2 shadow-sm">
                  <SurfaceRow label="Superficie cubierta" value={property.area} />
                  <SurfaceRow label="Superficie semicubierta" value={property.semiCoveredArea} />
                  <SurfaceRow label="Superficie descubierta" value={property.uncoveredArea} />
                  {(property.area || 0) + (property.semiCoveredArea || 0) + (property.uncoveredArea || 0) > 0 && (
                    <div className="flex items-center justify-between py-2.5 pt-3 border-t border-urbik-g100">
                      <span className="text-sm font-black text-urbik-black">Total</span>
                      <span className="text-sm font-black text-urbik-emerald">
                        {(property.area || 0) + (property.semiCoveredArea || 0) + (property.uncoveredArea || 0)} m²
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {detailRows.length > 0 && (
              <div>
                <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight mb-4 ml-2">Ficha Técnica</h3>
                <div className="px-6 py-2">
                  {detailRows.map((row, i) => (
                    <DetailRow key={i} icon={row.icon} label={row.label} value={row.value} />
                  ))}
                </div>
              </div>
            )}

            {property.description && (
              <div>
                <h3 className="text-2xl font-display font-bold text-urbik-muted tracking-tight mb-4 ml-2">Descripción</h3>
                <div className="bg-white p-8 rounded-2xl border border-urbik-g100 shadow-sm">
                  <div className="text-urbik-black/80 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                    {property.description}
                  </div>
                </div>
              </div>
            )}

            <FeaturesSection propertyType={property.type} legacyAmenities={property.legacyAmenities} featureGroups={property.featureGroups} />
          </div>

          <div className="lg:col-span-4 relative" id="contacto">
            <div className="sticky top-28 space-y-6">
              <div className="md:rounded-[30px] rounded-3xl border border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] before:absolute before:inset-0 before:rounded-[30px] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(250,250,250,0.9),rgba(240,240,240,0.45),rgba(255,255,255,0.9))] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:pointer-events-none">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex flex-col w-full justify-center items-center mt-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-urbik-muted mb-1">Comercializa</p>
                      <Link href={`/realestate/${property.realEstateId}`} className="hover:text-urbik-black/50 transition-colors">
                        <h4 className="text-xl font-black leading-tight">{property.RealEstate?.agencyName || "Inmobiliaria"}</h4>
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-3 mb-8 ml-3">
                    <div className="flex items-center gap-4 p-4">
                      <div className="p-2"><Phone size={18} className="text-urbik-dark" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-urbik-muted uppercase">Teléfono</p>
                        <span className="font-bold text-md">{property.RealEstate?.phone || "No disponible"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4">
                      <div className="p-2"><Mail size={18} className="text-urbik-dark" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-urbik-muted uppercase">Email</p>
                        <span className="font-bold text-md">Consultar</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/realestate/${property.realEstateId}`} className="block mt-4 mb-5 italic text-center text-xs font-bold text-urbik-muted hover:text-urbik-black underline decoration-dashed">
                    Ver todas las propiedades
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <InquiryForm propertyId={property.id} />
        {property.realEstateId && property.realEstateId !== userId && (
                <div className="mt-4 w-full items-end flex justify-end">
            <StartChatButton propertyId={property.id} realEstateId={property.realEstateId as string} />
          </div>
        )}
        
        <div className="mt-12 sm:mt-24 pt-8 sm:pt-12 border-t border-urbik-g100">
          <h3 className="text-2xl sm:text-3xl font-display text-urbik-black tracking-tighter mb-6 sm:mb-8">
            <span className="font-medium">Más propiedades de </span>
            <span className="font-black italic uppercase text-urbik-black">{property.RealEstate?.agencyName || "la inmobiliaria"}</span>
          </h3>
          {otherProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {otherProperties.map((other) => (
                <div key={other.id} className="group relative flex flex-col h-full bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <Link href={`/property/${other.id}`} className="absolute inset-0 z-10" />
                  <div className="absolute top-3 right-3 z-20"><FavoriteButton propertyId={other.id} initialIsFavorite={!!other.isFavorite} small /></div>
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <Image src={other.images[0] || "/placeholder-property.jpg"} alt={other.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute bottom-3 left-3 flex gap-2 z-10">
                      <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-bold uppercase">{getPropertyLabel(other.type)}</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col grow">
                    <h3 className="text-md font-bold mb-1 line-clamp-2 text-urbik-dark group-hover:text-urbik-black/60 transition-colors">{other.title}</h3>
                    <div className="flex items-center text-urbik-muted mb-4 text-xs font-medium"><MapPin size={12} className="mr-1" /><p>{other.city}</p></div>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-end">
                      <p className="text-[10px] font-bold text-urbik-muted uppercase tracking-wider">{getOperationLabel(other.operationType)}</p>
                      <p className="text-lg font-black text-urbik-dark">{other.currency} {(other.salePrice || other.rentPrice || 0).toLocaleString("es-AR")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
              <Building2 size={40} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">Esta inmobiliaria no tiene otras propiedades similares.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}