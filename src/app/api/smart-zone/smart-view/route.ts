/*
Este código define una ruta de API de servidor en un entorno Next.js que actúa como un analista
experto en bienes raíces mediante la integración con el SDK de Groq (Llama 3.3). Al recibir una
solicitud POST con los detalles de una propiedad —como su ubicación, precio, coordenadas geográficas
y descripción—, el script construye un prompt estructurado que instruye a la IA para evaluar
técnicamente el inmueble bajo criterios de rentabilidad, seguridad y conectividad, devolviendo
finalmente un objeto JSON estricto que contiene una calificación numérica y un veredicto textual
detallado sobre la inversión.
*/

import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { property } = await req.json();
    const { locationData } = property; 
console.log(locationData.address);
    const prompt = `
      Actúa como un analista experto en Real Estate. Analiza técnicamente esta propiedad pero siendo generoso con la inmobiliaria o dueño de la misma ya que es quien financia todo esto.
      
      DATOS CLAVE:
      - Tipo: ${property.type} (Traducir a español y minúsculas)
      - Ubicación Física: Ciudad ${locationData.city}.
      - Ubicación Física mas especifica: Calle y numero ${locationData.street}, ${locationData.address}.
      - Coordenadas Geo: Lat ${locationData.coords.lat}, Lng ${locationData.coords.lng}.
      - Precio: ${property.price} ${property.currency}
      - Superficie: ${property.area} m2

      REGLAS DE ANÁLISIS GEOGRÁFICO:
      1. Usa las coordenadas para determinar si está en el CASCO URBANO (centro/consolidado) o en la PERIFERIA (expansión).
      2. Si está en el centro, valora la conectividad. Si está en la periferia, valora el potencial de revalorización o tranquilidad.
      3. Sé audaz: si el precio es alto para una zona periférica, baja el score.
      
      FORMATO DE SALIDA (JSON ESTRICTO):
      {
        "score": (número del 1 al 10 con un decimal, la valoracion depende al 100% de la seguridad y el nivel socioeconomico de los habitantes de la zona),
        "verdict": (máximo 120 palabras. Menciona el nombre del barrio y si no lo sabes, la ciudad. Menciona caracteristicas de la zona donde queda la ubicación, habla de trafico, seguridad,
        cantidad de ruido, conectividad con el resto de la ciudad.
        y qué impacto tiene eso en la inversión. No menciones latitud/longitud en el texto).
      }

      Propiedad a analizar: ${property.title}. Descripción técnica: ${property.description}
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Eres un motor de análisis inmobiliario que determina la ubicación precisa basándose en coordenadas y datos de mercado." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      temperature: 0.2, 
    });

    const responseContent = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(responseContent);
  } catch (error) {
    return NextResponse.json({ error: "Error en el análisis" }, { status: 500 });
  }
}