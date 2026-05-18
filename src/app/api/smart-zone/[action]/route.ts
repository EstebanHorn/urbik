import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "Configuración de IA incompleta" }, { status: 500 });
  }

  try {
    const body = await req.json();
    let prompt = "";
    let systemContent = "Eres un asistente técnico experto en Real Estate.";
    let temp = 0.3;
    let isJson = false;

    switch (action) {
      case "smart-view":
        const { property } = body;
        systemContent = "Eres un motor de análisis inmobiliario que determina la ubicación precisa basándose en coordenadas y datos de mercado.";
        temp = 0.2;
        isJson = true;
        prompt = `Actúa como un analista experto en Real Estate...
          DATOS CLAVE:
          - Tipo: ${property.type}
          - Ubicación Física: Ciudad ${property.locationData.city}.
          - Coordenadas Geo: Lat ${property.locationData.coords.lat}, Lng ${property.locationData.coords.lng}.
          - Precio: ${property.price} ${property.currency}
          FORMATO DE SALIDA (JSON ESTRICTO): {"score": 9.5, "verdict": "texto breve"}
          Propiedad: ${property.title}. Descripción: ${property.description}`;
        break;

      case "smart-description":
        systemContent = "Eres un experto en Copywriting Inmobiliario...";
        prompt = `Analiza la siguiente descripción de una propiedad inmobiliaria en no mas de 60 palabras...\n"${body.description}"\nContexto: ${JSON.stringify(body.context)}`;
        break;

      case "smart-compare":
        systemContent = "Eres un asistente técnico que describe ubicaciones de forma objetiva. No interpretas datos, solo los relatas de forma elegante y breve.";
        temp = 0.1;
        prompt = `Analiza estas propiedades para un cliente: ${JSON.stringify(body.properties)}
          REGLAS: COHERENCIA GEOGRÁFICA, UBICACIÓN (centro vs periferia). Máximo 70 palabras, un solo párrafo. Recomienda una opción.`;
        break;

      case "smart-area":
        systemContent = "Eres un analista inmobiliario experto y conciso.";
        temp = 0.5;
        prompt = `Analiza técnicamente en no mas de 150 palabras, esta ubicación en un radio de 1km:
          - Dirección: ${body.address}
          - Zona: ${body.zone}
          - Coordenadas: ${body.lat}, ${body.lng}
          REGLAS: Un solo párrafo. Sé objetivo. Menciona accesibilidad, transporte, seguridad. Nunca menciones latitud/longitud.`;
        break;

      default:
        return NextResponse.json({ error: "Acción de IA no reconocida" }, { status: 404 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: prompt }
      ],
      model: action === "smart-view" ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant",
      temperature: temp,
      response_format: isJson ? { type: "json_object" } : undefined,
    });

    const responseContent = completion.choices[0]?.message?.content || "";

    if (isJson) {
      return NextResponse.json(JSON.parse(responseContent));
    }

    return NextResponse.json({ text: responseContent });

  } catch (error) {
    console.error(`Error en IA (${action}):`, error);
    return NextResponse.json({ error: "Error procesando la solicitud de IA" }, { status: 500 });
  }
}