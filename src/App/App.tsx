import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useEffect, useState } from 'react';

import { RandomLocationButton } from './RandomLocationButton/RandomLocationButton';
import { getRandomCoordinates, type Coordinates, type Language } from './utils';
import { LanguageSelector } from './LanguageSelector/LanguageSelector';
import { markerIcon } from './MarkerIcon/MarkerIcon';

import './App.css';

type AddressState =
  | { status: 'loading' }
  | { status: 'loaded'; address: string }
  | { status: 'error'; reason: 'notFound' | 'requestFailed' };

const translations = {
  fi: {
    language: 'Kieli',
    randomLocation: 'Tee löytöretki!',
    loadingAddress: 'Ladataan osoitetta...',
    addressNotFound: 'Osoitetta ei löytynyt annetuille koordinaateille.',
    addressRequestFailed: 'Osoitteen haku epäonnistui.',
    mapAttribution: 'kartantekijät',
  },
  en: {
    language: 'Language',
    randomLocation: 'Go explore!',
    loadingAddress: 'Loading address...',
    addressNotFound: 'No address found for these coordinates.',
    addressRequestFailed: 'Address lookup failed.',
    mapAttribution: 'contributors',
  },
} satisfies Record<Language, Record<string, string>>;

function App() {
  const [language, setLanguage] = useState<Language>('fi');
  const [coordinates, setCoordinates] = useState<Coordinates>(() => getRandomCoordinates());
  const [addressState, setAddressState] = useState<AddressState>({
    status: 'loading',
  });
  const text = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      format: 'jsonv2',
      lat: String(coordinates[0]),
      lon: String(coordinates[1]),
      'accept-language': language,
    });

    async function loadAddress() {
      setAddressState({ status: 'loading' });

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?${params}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          setAddressState({ status: 'error', reason: 'requestFailed' });
          return;
        }

        const result: { display_name?: unknown } = await response.json();
        if (typeof result.display_name !== 'string') {
          setAddressState({ status: 'error', reason: 'notFound' });
          return;
        }

        setAddressState({ status: 'loaded', address: result.display_name });
      } catch {
        if (controller.signal.aborted) return;
        setAddressState({ status: 'error', reason: 'requestFailed' });
      }
    }

    void loadAddress();
    return () => controller.abort();
  }, [coordinates, language]);

  return (
    <MapContainer center={coordinates} zoom={5} scrollWheelZoom={false}>
      <TileLayer
        attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ${text.mapAttribution}`}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LanguageSelector language={language} setLanguage={setLanguage} text={text} />
      <RandomLocationButton
        label={text.randomLocation}
        onCoordinatesChange={setCoordinates}
      />
      <Marker position={coordinates} icon={markerIcon}>
        <Popup>
          {addressState.status === 'loading' && text.loadingAddress}
          {addressState.status === 'loaded' && addressState.address}
          {addressState.status === 'error' &&
            (addressState.reason === 'notFound'
              ? text.addressNotFound
              : text.addressRequestFailed)}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default App;
