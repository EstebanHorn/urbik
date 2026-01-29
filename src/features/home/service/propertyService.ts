/*
Este fragmento de código define la estructura de datos y la lógica de acceso a datos para
gestionar propiedades destacadas en una aplicación. Primero, establece una interfaz de
TypeScript llamada FeaturedProperty que detalla los atributos técnicos y descriptivos de
un inmueble, como su precio, ubicación y características físicas. Posteriormente, exporta
un objeto de servicio denominado propertyService que contiene dos métodos asíncronos: uno
para obtener la lista de propiedades destacadas desde una API mediante una petición GET y
otro para alternar el estado de favorito de una propiedad específica enviando su
identificador a través de una petición POST.
*/

export interface FeaturedProperty {
  id: string;
  title: string;
  price: number;
  operationType: string;
  address: string;
  city: string;
  images: string[];
  rooms: number;
  area: number;
  type: string;
  description?: string;
  isFavorite?: boolean;
}

export const propertyService = {
  async getFeaturedProperties(): Promise<FeaturedProperty[]> {
    const res = await fetch("/api/properties/featured");
    if (!res.ok) throw new Error("Error cargando destacados");
    return res.json();
  },

  async toggleFavorite(propertyId: string): Promise<boolean> {
    const res = await fetch("/api/properties/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });
    return res.ok;
  },
};