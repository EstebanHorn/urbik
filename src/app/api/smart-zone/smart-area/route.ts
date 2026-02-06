/*
Este código define una ruta de API en Next.js que procesa solicitudes POST para generar análisis
inmobiliarios automatizados utilizando la inteligencia artificial de Groq. El script extrae datos
geográficos de la petición, construye un mensaje estructurado con instrucciones técnicas específicas
y utiliza el modelo Llama 3.1 para generar un informe profesional y crítico sobre el entorno,
la accesibilidad, el transporte y la seguridad de una ubicación determinada, retornando finalmente
el resultado en formato JSON.
*/
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { lat, lng, address, zone } = await req.json();

    const prompt = `Analiza técnicamente en no mas de 150 palabras, esta ubicación teniendo en cuenta un radio de 1km:
    - Dirección: ${address}
    - Zona: ${zone}
    - Coordenadas: ${lat}, ${lng}

    REGLAS:
    1. Describe el entorno de forma breve y profesional.
    2. Indica si es una zona consolidada, residencial o comercial según el contexto.
    3. Menciona la accesibilidad general basada en la ubicación.
    4. Formato: Un solo párrafo muy corto y resumido.
    5. No uses listas ni negritas.
    6. Sé objetivo y técnico.
    7. No menciones calles.
    8. Menciona cercania al centro.
    9. Menciona posibilidades de transporte publico.
    10. Menciona y se muy critico con laseguridad del lugar.
    11. Nunca mencionar latitud o longitud`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un analista inmobiliario experto y conciso.",
        },
        { role: "user", content: prompt },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
    });

    return NextResponse.json({
      text:
        completion.choices[0]?.message?.content || "Análisis no disponible.",
    });
  } catch (error) {
    console.error("Error en Zone Analysis:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
