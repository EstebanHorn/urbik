export interface ReviewUser {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export interface ReviewsResponse {
  summary: ReviewSummary;
  reviews: Review[];
  myReview: Review | null;
}

export interface ReviewPayload {
  rating: number;
  comment: string;
}

async function parseError(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return new Error(data.error ?? fallback);
  } catch {
    return new Error(fallback);
  }
}

export const reviewService = {
  async getReviews(realEstateId: string): Promise<ReviewsResponse> {
    if (!realEstateId) throw new Error("ID de inmobiliaria no suministrado");
    const res = await fetch(`/api/realestate/${realEstateId}/reviews`, {
      cache: "no-store",
    });
    if (!res.ok) throw await parseError(res, "Error al obtener las reseñas");
    return res.json();
  },

  async createReview(
    realEstateId: string,
    payload: ReviewPayload
  ): Promise<Review> {
    if (!realEstateId) throw new Error("ID de inmobiliaria no suministrado");
    const res = await fetch(`/api/realestate/${realEstateId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await parseError(res, "Error al publicar la reseña");
    return res.json();
  },

  async updateReview(
    realEstateId: string,
    payload: ReviewPayload
  ): Promise<Review> {
    if (!realEstateId) throw new Error("ID de inmobiliaria no suministrado");
    const res = await fetch(`/api/realestate/${realEstateId}/reviews`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw await parseError(res, "Error al actualizar la reseña");
    return res.json();
  },

  async deleteReview(realEstateId: string): Promise<void> {
    if (!realEstateId) throw new Error("ID de inmobiliaria no suministrado");
    const res = await fetch(`/api/realestate/${realEstateId}/reviews`, {
      method: "DELETE",
    });
    if (!res.ok) throw await parseError(res, "Error al eliminar la reseña");
  },
};
