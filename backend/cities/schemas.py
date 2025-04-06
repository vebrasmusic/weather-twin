from typing import List, Optional

from meteostat import Base
from pydantic import BaseModel, ConfigDict, Field


class Embeddings(BaseModel):
    """
    Represents a city's data vector post embedding.
    3d vector
    """

    embed_x: float
    embed_y: float
    embed_z: float


class Stats(BaseModel):
    windspeed: list[float] | None = None
    pressure: list[float] | None = None
    temp: list[float] | None = None
    rainfall: list[float] | None = None


class CityMeta(BaseModel):
    """
    Represents a city's metadata, including hte output cities.
    """

    city: str
    lat: float
    lng: float
    koppen_code: str
    koppen_description: str
    country: str | None = None
    stats: Stats | None = None
    description: str | None = None


class CityData(BaseModel):
    """
    Represents a ciryt and metadata after fetch.
    """

    embeddings: Embeddings
    metadata: CityMeta
    score: float | None = None


class PineconeQueryMatch(BaseModel):
    id: str
    metadata: CityMeta
    score: float
    values: list[float]


class PineconeQueryResponse(BaseModel):
    """
    Represents the query response returned from Pinecone.
    """

    matches: list[PineconeQueryMatch]
    namespace: str
    usage: dict[str, int]


class WeatherTwinResponse(BaseModel):
    input: CityData
    matches: list[CityData]


class Address(BaseModel):
    neighbourhood: str
    suburb: str
    city: str
    county: str
    state: str
    ISO3166_2_lvl4: str
    postcode: str
    country: str
    country_code: str


class PlaceResponse(BaseModel):
    place_id: int
    licence: str
    osm_type: str
    osm_id: int
    lat: str
    lon: str
    place_class: str = Field(..., alias="class")
    place_type: str = Field(..., alias="type")
    place_rank: int
    importance: float
    addresstype: str
    name: str
    display_name: str
    address: Address
    boundingbox: list[str]

    model_config = ConfigDict(populate_by_name=True)
