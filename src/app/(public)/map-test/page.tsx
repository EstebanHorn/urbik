import GoogleMapProvider from '@/components/google-map/GoogleMapProvider';
import GoogleMapClient from '@/components/google-map/GoogleMapClient';

export default function TestMapPage() {
  return (
    <GoogleMapProvider>
      <GoogleMapClient lat={-34.92145} lon={-57.95453} />
    </GoogleMapProvider>
  );
}