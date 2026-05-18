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