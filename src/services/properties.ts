export interface PropertyPayload {
  [key: string]: unknown;
}

export const propertyService = {
  async createProperty(payload: PropertyPayload) {
    const res = await fetch("/api/property/parcel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Error al crear la propiedad");
    }
    return res.json();
  },

  async updateProperty(id: string | number, payload: PropertyPayload) {
    if (!id) throw new Error("ID de propiedad no suministrado");

    const res = await fetch(`/api/property/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Error al actualizar");
    }
    return res.json();
  },

  async deleteProperty(id: string | number) {
    if (!id) throw new Error("ID de propiedad no suministrado");

    const res = await fetch(`/api/property/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Error al eliminar la propiedad");
    }
    return res.json();
  }
};