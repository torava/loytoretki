import { useMap } from 'react-leaflet';

import { getRandomCoordinates, type Coordinates } from '../utils';

import './RandomLocationButton.css';

export function RandomLocationButton({
  label,
  onCoordinatesChange,
}: {
  label: string;
  onCoordinatesChange: (coordinates: Coordinates) => void;
}) {
  const map = useMap();

  function setRandomLocation() {
    const coordinates: Coordinates = getRandomCoordinates();
    onCoordinatesChange(coordinates);
    map.flyTo(coordinates, map.getZoom());
  }

  return (
    <button
      className="random-location-button"
      onClick={(event) => {
        event.stopPropagation();
        setRandomLocation();
      }}
      type="button"
    >
      {label}
    </button>
  );
}
