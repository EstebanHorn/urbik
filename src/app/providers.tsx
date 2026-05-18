  "use client";

  import { MapSettingsProvider } from "@/components/map/MapSettingsProvider";

  export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <MapSettingsProvider>
        {children}
      </MapSettingsProvider>
    );
  }