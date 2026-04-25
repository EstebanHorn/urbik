import type { FeatureCollection, Geometry } from "geojson";

interface RioNegroParcelProperties {
  province?: string;
  [key: string]: unknown;
}

export async function fetchRioNegroParcelsByProvince(
  province?: string
): Promise<FeatureCollection<Geometry, RioNegroParcelProperties>> {
  const params = new URLSearchParams();
  if (province) {
    params.append("province", province);
  }

  const response = await fetch(`/api/parcels/rionegro?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch Río Negro parcels: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchRioNegroAllParcels(): Promise<
  FeatureCollection<Geometry, RioNegroParcelProperties>
> {
  return fetchRioNegroParcelsByProvince();
}
