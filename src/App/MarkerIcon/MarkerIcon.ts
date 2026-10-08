import { divIcon } from 'leaflet';

import './MarkerIcon.css';

export const markerIcon = divIcon({
  className: 'custom-marker-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
  html: '<div class="custom-marker-icon__cross" aria-hidden="true"></div>',
});
