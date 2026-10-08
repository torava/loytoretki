export type Language = 'fi' | 'en';

export type Coordinates = [number, number];

export const getRandomCoordinates = (): [number, number] => [
  -90 + Math.random() * 180,
  -180 + Math.random() * 360,
];
