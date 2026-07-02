"use client";

export const dynamic = "force-dynamic";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

import DesktopSearchFilterBar from "@/components/search/DesktopSearchFilterBar";
import MobileSearchFilterBar from "@/components/search/MobileSearchFilterBar";
import {
  appendFiltersToApiQuery,
  applyFiltersToParams,
  areFiltersEqual,
  parseFiltersFromQuery,
  type FilterState,
} from "@/utils/propertyFilters";
import {
  getOperationLabel,
  getTypeLabel,
  type SearchProperty,
} from "@/app/(public)/page";

const PAGE_SIZE = 24;

const cardStyle =
  "rounded-3xl md:rounded-[30px] border border-slate-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)]";

function PropertyCard({ property }: { property: SearchProperty }) {
  const price = property.salePrice ?? property.rentPrice ?? 0;
  const currency = property.saleCurrency ?? property.rentCurrency ?? "ARS";

  return (
    <Link
      href={`/property/${property.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${cardStyle}`}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {property.images?.[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 text-xs font-bold text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-geora-white2 group-hover:bg-geora-black px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-geora-black/80">
          {getTypeLabel(property.type)} en {getOperationLabel(property.operationType)}
        </span>

        <h3 className="line-clamp-2 text-base font-black tracking-tight text-geora-black">
          {property.title}
        </h3>

        <p className="truncate text-xs font-medium text-geora-black/50">
          {property.displayAddress || property.address}, {property.city}
        </p>

        <div className="mt-auto pt-3 text-lg font-black tracking-tight text-geora-black">
          {currency} {Number(price).toLocaleString("es-AR")}
        </div>
      </div>
    </Link>
  );
}

export default function PropertiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const skipUrlSync = useRef(true);

  const [items, setItems] = useState<SearchProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const initialPage = Math.max(
    1,
    Number.parseInt(searchParams.get("page") || "1", 10) || 1,
  );
  const [page, setPage] = useState(initialPage);

  const [filters, setFilters] = useState<FilterState>(() =>
    parseFiltersFromQuery(new URLSearchParams(searchParams.toString())),
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const nextFilters = parseFiltersFromQuery(params);
    const nextPage = Math.max(
      1,
      Number.parseInt(params.get("page") || "1", 10) || 1,
    );

    setFilters((prev) =>
      areFiltersEqual(prev, nextFilters) ? prev : nextFilters,
    );
    setPage((prev) => (prev === nextPage ? prev : nextPage));
    skipUrlSync.current = true;
  }, [searchParams]);

  const syncUrl = useCallback(
    (nextFilters: FilterState, nextPage: number) => {
      const paramsWithFilters = applyFiltersToParams(
        new URLSearchParams(searchParams.toString()),
        nextFilters,
      );
      paramsWithFilters.set("page", String(nextPage));

      const nextQuery = paramsWithFilters.toString();
      if (nextQuery === searchParams.toString()) return;

      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    syncUrl(filters, page);
  }, [filters, page, syncUrl]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      appendFiltersToApiQuery(query, filters);

      const res = await fetch(`/api/properties/search?${query.toString()}`);
      if (!res.ok) {
        setItems([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }

      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error cargando el listado:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchData();
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-white">
      <DesktopSearchFilterBar />
      <MobileSearchFilterBar />

      <div className="mx-auto w-full max-w-7xl px-4 pt-32 pb-24 md:px-8 md:pt-[152px] md:pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-geora-black/80">
              Listado de propiedades
            </h1>
            <span className="text-sm text-geora-black/50">
              {isLoading ? "Buscando..." : `${total} propiedades encontradas`}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={idx} className={`${cardStyle} h-72 animate-pulse`} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={`${cardStyle} p-10 text-center text-sm font-semibold text-slate-500`}>
            No se encontraron propiedades con esos filtros.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-full border border-slate-200 bg-white px-4 md:px-5 py-2 text-[10px] md:text-xs font-black tracking-wide text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30"
          >
            Anterior
          </button>
          <span className="text-[10px] md:text-xs font-bold tracking-wide text-slate-500">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-full border border-slate-200 bg-white px-4 md:px-5 py-2 text-[10px] md:text-xs font-black tracking-wide text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
