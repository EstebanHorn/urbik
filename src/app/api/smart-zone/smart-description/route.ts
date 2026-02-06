/*
Este código define una ruta de API en un entorno Next.js que actúa como un servicio de
copywriting inmobiliario utilizando la inteligencia artificial de Groq. Al recibir una
solicitud POST con la descripción y el contexto de una propiedad, el script valida la
configuración de la API y la longitud del texto antes de enviar un prompt estructurado al
modelo Llama 3.1 8B, solicitando un análisis crítico y una sugerencia de mejora en un
formato de párrafo único, profesional y limitado a 60 palabras. Finalmente, procesa la
respuesta generada por la IA y la devuelve al cliente en formato JSON, manejando posibles 
errores de servidor o de configuración durante el proceso.
*/
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Configuración incompleta" },
        { status: 500 },
      );
    }

    const { description, context } = await req.json();

    if (!description || description.length < 10) {
      return NextResponse.json({
        text: "La descripción es demasiado corta para analizarla.",
      });
    }

    const prompt = `
      Analiza la siguiente descripción de una propiedad inmobiliaria en no mas de máximo 60 palabras...
      (Resto del prompt igual)
      "${description}"
      Contexto adicional: ${JSON.stringify(context)}
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un experto en Copywriting Inmobiliario...",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
    });

    const responseText =
      completion.choices[0]?.message?.content ||
      "No se pudo generar el análisis.";
    return NextResponse.json({ text: responseText });
  } catch (_error) {
    // CORRECCIÓN: _error para variable no usada y sin tipo any explícito
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
