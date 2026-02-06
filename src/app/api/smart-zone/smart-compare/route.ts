/*
Este código implementa una ruta de API en Next.js que actúa como un endpoint de tipo POST
para analizar datos inmobiliarios mediante el modelo Llama 3.1 de la plataforma Groq. La
función extrae una lista de propiedades del cuerpo de la solicitud, valida la existencia
de la clave de API necesaria y genera un análisis técnico y objetivo basado en un conjunto
estricto de reglas de negocio que priorizan la coherencia geográfica y la ubicación por
coordenadas. Finalmente, el servidor retorna una respuesta en formato JSON que contiene una
breve recomendación de aproximadamente 70 palabras sobre qué opciones son mejores para habitar
o invertir, manteniendo una alta precisión técnica gracias a una baja temperatura de respuesta
del modelo.
*/
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error("ERROR: Falta la variable GROQ_API_KEY en el .env");
      return NextResponse.json(
        { error: "Configuración incompleta" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { properties } = body;

    const prompt = `Analiza estas propiedades para un cliente:
    ${JSON.stringify(properties)}

    REGLAS DE ORO PARA EL ANÁLISIS:
    1. COHERENCIA GEOGRÁFICA: Si las propiedades tienen el mismo 'share_zone_with', DEBES tratarlas como la misma zona. No inventes que una es más segura que otra.
    2. UBICACIÓN: Usa las coordenadas para comentar si están en el casco urbano (centro) o en la periferia.
    3. REPUTACIÓN: No inventes crímenes. Habla de "zona consolidada" (centro) o "zona en expansión" (afueras).
    4. FORMATO: Un solo párrafo corto, sin listas, sin "Casa 1:". 
    5. CIERRE: Termina recomendando una opción para habitar y otra para inversión según su ubicación.
    6. Máximo 70 palabras. Temperatura de respuesta: BAJA (precisión técnica).`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente técnico que describe ubicaciones de forma objetiva. No interpretas datos, solo los relatas de forma elegante y breve.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
    });

    const responseText =
      completion.choices[0]?.message?.content ||
      "No se pudo generar un análisis.";

    return NextResponse.json({ text: responseText });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("Error en Groq API:", message);

    return NextResponse.json(
      { error: "Error al procesar la solicitud", details: message },
      { status: 500 },
    );
  }
}
