export type Region = "buenos-aires" | "rio-negro" | "other";

const RIO_NEGRO_BOUNDS = {
  minLat: -41.79,
  maxLat: -37.93,
  minLon: -71.99,
  maxLon: -65.50,
};

const BUENOS_AIRES_BOUNDS = {
  minLat: -35.88,
  maxLat: -33.05,
  minLon: -62.13,
  maxLon: -56.19,
};

export function detectRegion(lat: number, lon: number): Region {
  if (
    lat >= RIO_NEGRO_BOUNDS.minLat &&
    lat <= RIO_NEGRO_BOUNDS.maxLat &&
    lon >= RIO_NEGRO_BOUNDS.minLon &&
    lon <= RIO_NEGRO_BOUNDS.maxLon
  ) {
    return "rio-negro";
  }

  if (
    lat >= BUENOS_AIRES_BOUNDS.minLat &&
    lat <= BUENOS_AIRES_BOUNDS.maxLat &&
    lon >= BUENOS_AIRES_BOUNDS.minLon &&
    lon <= BUENOS_AIRES_BOUNDS.maxLon
  ) {
    return "buenos-aires";
  }

  return "other";
}

export function getZoomThresholdForRegion(region: Region): number {
  return region === "rio-negro" ? 14 : 15;
}
