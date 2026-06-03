"use client";

import { useEffect, useRef } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';

export default function GoogleSearchBar() {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!placesLibrary || !inputRef.current || !map) return;

    const autocomplete = new placesLibrary.Autocomplete(inputRef.current, {
      fields: ['geometry', 'name', 'formatted_address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.geometry?.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else if (place.geometry?.location) {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }
    });
  }, [placesLibrary, map]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Buscar direcciones, barrios..."
      className="w-full px-4 py-3 rounded-lg shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    />
  );
}