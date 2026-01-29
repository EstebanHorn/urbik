/*
Este código implementa un sistema de búsqueda híbrida de sugerencias que combina datos 
internos y externos. Su función principal, searchSuggestions, espera a que el usuario 
escriba al menos 3 caracteres para activar una búsqueda paralela: por un lado, consulta 
una API propia para encontrar usuarios de la inmobiliaria (RealEstateUser) y, por otro, 
consume un servicio externo para obtener sugerencias de mapas o ubicaciones. Finalmente, 
unifica ambos resultados en una sola lista, manejando posibles errores y validaciones 
básicas para optimizar las consultas.
*/

import { getMapSuggestions, Suggestion } from './mapApiService';

export type RealEstateUserSuggestion = {
  type: 'REALESTATE_USER';
  id: number;
  name: string;
  email: string;
};

export type SearchSuggestion = RealEstateUserSuggestion | Suggestion;

async function searchRealEstateUsers(query: string): Promise<RealEstateUserSuggestion[]> {


  const response = await fetch(`/api/search?q=${query}`);
  if (!response.ok) {
    console.error('Error al buscar usuarios REALESTATE:', response.statusText);
    return [];
  }
  const data = await response.json();
  return data.users as RealEstateUserSuggestion[];
}

export async function searchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 3) return [];

  try {
    const [userSuggestions, mapSuggestions] = await Promise.all([
      searchRealEstateUsers(query),
      getMapSuggestions(query), 
    ]);

    return [
      ...userSuggestions,
      ...mapSuggestions,
    ];
  } catch (error) {
    console.error('Error general en la búsqueda de sugerencias:', error);
    return [];
  }
}