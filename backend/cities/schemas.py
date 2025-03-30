from pydantic import BaseModel


class Embeddings(BaseModel):
    """
    Represents a city's data vector post embedding.
    3d vector
    """

    embed_x: float
    embed_y: float
    embed_z: float


class CityMeta(BaseModel):
    """
    Represents a city's metadata, including hte output cities.
    """

    city: str
    lat: float
    lng: float
    koppen_code: str
    koppen_description: str


class CityData(BaseModel):
    """
    Represents a ciryt and metadata after fetch.
    """

    embeddings: Embeddings
    metadata: CityMeta
