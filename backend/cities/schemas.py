from pydantic import BaseModel


class CityData(BaseModel):
    """
    Represents a city's data vector, pre embedding.
    """

    pass


class Embeddings(BaseModel):
    """
    Represents a city's data vector post embedding.
    3d vector
    """

    x: float
    y: float
    z: float


class CityMeta(BaseModel):
    """
    Represents a city's metadata, including hte output cities.


    """

    pass

