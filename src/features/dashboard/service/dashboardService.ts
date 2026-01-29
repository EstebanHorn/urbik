/*
Este código exporta dos funciones asíncronas para gestionar datos de propiedades mediante 
peticiones HTTP a una API: la primera, createProperty, envía una solicitud POST para registrar 
una nueva parcela utilizando un objeto payload, mientras que la segunda, updateProperty, 
utiliza el método PUT para modificar una propiedad existente identificada por su id. Ambas 
funciones transforman los datos a formato JSON, configuran las cabeceras correspondientes y 
cuentan con un mecanismo de manejo de errores que lanza una excepción con un mensaje descriptivo 
si la respuesta del servidor no es exitosa, retornando finalmente la respuesta procesada en caso 
de éxito.
*/

export const createProperty = async (payload: any) => {
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
};

export const updateProperty = async (id: string, payload: any) => {
  const res = await fetch(`/api/property/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Error al actualizar la propiedad");
  }
  return res.json();
};