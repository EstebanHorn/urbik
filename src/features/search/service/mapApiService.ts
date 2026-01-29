/*
Este código define una función asíncrona llamada getMapSuggestions que actúa como un
puente entre tu aplicación y la API de Nominatim (OpenStreetMap) para buscar direcciones.
Su objetivo principal es recibir un texto de búsqueda (query) y devolver una lista de hasta
5 sugerencias de ubicación filtradas específicamente para Argentina. El proceso incluye
realizar una petición HTTP, validar que la respuesta sea correcta y transformar los datos
crudos del servicio en un formato de objeto más limpio y tipado (denominado Suggestion),
asegurándose de incluir únicamente los resultados que contengan coordenadas geográficas
válidas (latitud y longitud).
*/

export type Suggestion = {
  type: "ADDRESS";
  display_name: string;
  lat: string;
  lon: string;
};

type NominatimItem = {
  display_name: string;
  lat?: string;
  lon?: string;
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function getMapSuggestions(query: string): Promise<Suggestion[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    countrycodes: "ar",
    limit: "5",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`);

  if (!response.ok) {
    console.error(
      "Error al buscar direcciones en Nominatim:",
      response.statusText
    );
    return [];
  }

  const data: NominatimItem[] = await response.json();

  const suggestions: Suggestion[] = data
    .filter((item) => item.lat && item.lon)
    .map((item) => ({
      type: "ADDRESS",
      display_name: item.display_name,
      lat: item.lat!,
      lon: item.lon!,
    }));

  return suggestions;
}
