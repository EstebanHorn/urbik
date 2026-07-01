// Los mensajes de chat sólo tienen un campo `body` de texto. Para mostrar una
// vista previa de una propiedad (en vez de un párrafo con el link pelado)
// codificamos una tarjeta como JSON dentro del body, prefijada con un marker
// que el receptor puede detectar sin tocar el schema de chat_messages.
const PREFIX = "GEORA_PROPERTY_CARD::";

export interface PropertyShareCard {
  id: string;
  title: string;
  image: string | null;
  price: string;
  city?: string | null;
  typeLabel?: string | null;
}

export function buildPropertyShareMessage(card: PropertyShareCard): string {
  return `${PREFIX}${JSON.stringify(card)}`;
}

export function parsePropertyShareMessage(body: string): PropertyShareCard | null {
  if (!body.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(body.slice(PREFIX.length));
    if (parsed && typeof parsed.id === "string" && typeof parsed.title === "string") {
      return parsed as PropertyShareCard;
    }
    return null;
  } catch {
    return null;
  }
}
