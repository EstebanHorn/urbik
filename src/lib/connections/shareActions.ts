import { buildPropertyShareMessage, type PropertyShareCard } from "@/lib/chat/propertyShare";

// Comparte el link de una propiedad por WhatsApp/email/portapapeles con un
// contacto. Usado tanto desde la Bolsa de Conexiones (respuestas recibidas)
// como desde el perfil de contacto (stock propio que matchea).
export function shareProperty(
  prop: { id: string; title: string },
  channel: "whatsapp" | "email" | "copy",
  client: { phone?: string | null; email?: string | null } | null | undefined
) {
  const url = `${window.location.origin}/property/${prop.id}`;
  const text = `Te comparto esta propiedad que puede interesarte: ${prop.title} - ${url}`;
  if (channel === "whatsapp") {
    const phone = client?.phone ? client.phone.replace(/\D/g, "") : "";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  } else if (channel === "email") {
    const to = client?.email || "";
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(
      "Propiedad para vos"
    )}&body=${encodeURIComponent(text)}`;
  } else {
    navigator.clipboard?.writeText(url);
  }
}

async function postMessage(threadId: string, body: string) {
  const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "No se pudo enviar el mensaje");
}

// Abre (o reutiliza) el chat interno con un cliente conectado a Geora y le
// envía una propiedad como tarjeta de vista previa. Devuelve el threadId
// para poder redirigir a /messages?thread=.
export async function sendPropertyViaChat(
  clientId: string,
  card: PropertyShareCard,
  introText = "Encontré una propiedad que se ajusta a lo que estabas buscando:"
): Promise<string> {
  const threadRes = await fetch(`/api/clients/${clientId}/chat`, { method: "POST" });
  const threadData = await threadRes.json();
  if (!threadRes.ok) throw new Error(threadData.error || "No se pudo abrir el chat");

  await postMessage(threadData.threadId, introText);
  await postMessage(threadData.threadId, buildPropertyShareMessage(card));

  return threadData.threadId as string;
}
