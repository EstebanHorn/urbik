/*
Este componente de React, denominado MapUpdater, se encarga de sincronizar de forma fluida la
vista de un mapa de Leaflet con nuevas coordenadas geográficas recibidas mediante la prop center.
Para optimizar el rendimiento y evitar ejecuciones redundantes, utiliza una referencia (lastCenterRef)
que compara las coordenadas actuales con las anteriores, disparando una transición animada con map.flyTo
solo cuando detecta un cambio real; además, implementa un breve retraso mediante setTimeout y una
limpieza de efectos para asegurar que el contenedor del mapa esté listo antes de la animación y prevenir
errores de ejecución si las coordenadas cambian rápidamente.
*/

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const lastCenterRef = React.useRef<string>("");

  useEffect(() => {
    if (!map || !center) return;

    const centerKey = `${center[0]}-${center[1]}`;
    if (lastCenterRef.current === centerKey) return;

    const timeoutId = setTimeout(() => {
      try {
        if (map.getContainer()) {
          map.flyTo(center, 17, { animate: true, duration: 1.5 });
          lastCenterRef.current = centerKey;
        }
      } catch (e) {
        console.warn("Leaflet no estaba listo para flyTo", e);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [center, map]);

  return null;
}