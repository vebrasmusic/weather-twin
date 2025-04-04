export type Embeddings = {
  embed_x: number;
  embed_y: number;
  embed_z: number;
};
export type Stats = {
  pressure: number[] | null;
  rainfall: number[] | null;
  windspeed: number[] | null;
  temp: number[] | null;
};
export type CityMeta = {
  city: string;
  lat: number;
  lng: number;
  koppen_code: string;
  koppen_description: string;
  country: string | null;
  stats: Stats;
};
export type CityData = {
  embeddings: Embeddings;
  metadata: CityMeta;
  score: number | null;
};

export type WeatherTwinResponse = {
  input: CityData;
  matches: CityData[];
};
