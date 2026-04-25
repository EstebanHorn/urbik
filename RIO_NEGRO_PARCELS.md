# Integración de Parcelas de Río Negro

## Descripción

Esta rama (`rionegro`) integra las parcelas de Río Negro obtenidas del servidor ArcGIS de la Agencia de Tierras de Río Negro.

## Fuente de Datos

**Base URL**: `http://mapasagencia.rionegro.gov.ar/server/rest/services/Hosted/PARCELARIO/FeatureServer/0`

**Endpoint Query**: `/query?where=1=1&outFields=*&f=json`

## Componentes

### 1. Endpoint API: `/api/parcels/rionegro`

**Archivo**: `src/app/api/parcels/rionegro/route.ts`

- **Método**: GET
- **Parámetros Query**:
  - `province` (opcional): Filtra parcelas por provincia
  
- **Respuesta**: GeoJSON FeatureCollection

**Ejemplo de uso**:
```bash
# Obtener todas las parcelas
curl http://localhost:3000/api/parcels/rionegro

# Obtener parcelas de una provincia
curl "http://localhost:3000/api/parcels/rionegro?province=Río%20Negro"
```

### 2. Componente de Mapa: `RioNegroParcelLayer`

**Archivo**: `src/features/map/components/RioNegroParcelLayer.tsx`

- Carga automáticamente las parcelas de Río Negro
- Estilo distintivo en rojo (#e74c3c)
- Interactividad:
  - **Click**: Selecciona y resalta la parcela
  - **Hover**: Muestra efecto visual de enfoque
  - **Popup**: Muestra información de la parcela

### 3. Servicio de Utilidad

**Archivo**: `src/features/map/services/rioNegroService.ts`

Proporciona funciones helper para consultar los datos de Río Negro:

```typescript
import { fetchRioNegroParcelsByProvince, fetchRioNegroAllParcels } from "@/features/map/services/rioNegroService";

// Obtener todas las parcelas
const allParcels = await fetchRioNegroAllParcels();

// Obtener parcelas por provincia
const provinceParcels = await fetchRioNegroParcelsByProvince("Río Negro");
```

## Integración en el Mapa

El componente `RioNegroParcelLayer` se renderiza automáticamente en `InteractiveMapClient` junto a las otras capas de parcelas.

**Orden de capas** (de atrás adelante):
1. StaticParcelsLayer (amarillo/naranja)
2. RioNegroParcelLayer (rojo) ← Nueva
3. DbParcelsLayer (propiedades del usuario)
4. SelectedParcelLayer (resaltado)

## Estilo de Visualización

- **Color de borde**: #e74c3c (rojo)
- **Color de relleno**: #e74c3c con 20% opacidad
- **Peso de borde**: 1.2px (normal), 2.5px (resaltado)
- **Opacidad al hover**: 30%, 40% (resaltado)

## Manejo de Errores

El endpoint y componente manejan:
- Servicio ArcGIS no disponible
- Respuestas vacías
- Geometrías inválidas
- Errores de red

En caso de error, se registra en consola y se muestra una FeatureCollection vacía.

## Desarrollo

Para probar localmente:

1. Asegúrate de que el servidor de desarrollo está corriendo:
   ```bash
   npm run dev
   ```

2. Navega a cualquier página con mapa (ej: `/map`)

3. Las parcelas de Río Negro aparecerán en rojo

4. Verifica en la consola de navegador para mensajes de error

## Próximas Mejoras

- [ ] Caché de datos con estampilla de tiempo
- [ ] Filtrado dinámico por provincia en UI
- [ ] Sincronización con base de datos local
- [ ] Estadísticas de parcelas por tipo
- [ ] Export de datos parciales
