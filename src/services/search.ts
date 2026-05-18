export type Suggestion = {
  type: "ADDRESS";
  display_name: string;
  lat: string;
  lon: string;
};

export type RealEstateUserSuggestion = {
  type: "REALESTATE_USER";
  id: number;
  name: string;
  email: string;
};

export type SearchSuggestion = RealEstateUserSuggestion | Suggestion;

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type SearchApiResponse = {
  users?: RealEstateUserSuggestion[];
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function getMapSuggestions(
  query: string,
): Promise<Suggestion[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    countrycodes: "ar",
    limit: "5",
  });

  try {
    const response = await fetch(
      `${NOMINATIM_URL}?${params.toString()}`,
    );

    if (!response.ok) return [];

    const data: NominatimResult[] = await response.json();

    return data
      .filter((item) => item.lat && item.lon)
      .map((item) => ({
        type: "ADDRESS",
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
      }));
  } catch {
    return [];
  }
}

export async function searchSuggestions(
  query: string,
): Promise<SearchSuggestion[]> {
  if (!query || query.length < 3) return [];

  try {
    const [userResponse, mapSuggestions] = await Promise.all([
      fetch(`/api/search?q=${query}`).then<SearchApiResponse>((r) =>
        r.ok ? r.json() : { users: [] },
      ),
      getMapSuggestions(query),
    ]);

    return [...(userResponse.users || []), ...mapSuggestions];
  } catch (error) {
    console.error("Error en búsqueda:", error);
    return [];
  }
}