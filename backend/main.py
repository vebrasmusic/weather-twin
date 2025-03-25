from typing import List
from fastapi import FastAPI
from schemas import CityData, Embeddings, CityMeta
from meteostat import Stations, Normals
from geopy.geocoders import Nominatim

app = FastAPI()


def get_city_data(city_name: str):
    geolocator = Nominatim(user_agent="weather-twin")
    location = geolocator.geocode(city_name, exactly_one=True)
    if location is None:
        raise ValueError("City could not be geocoded.")
    print(location)


def get_embeddings(city_data: CityData) -> Embeddings:
    # run torch here w/ the model, get out embeddings
    pass


@app.get("/matches")
def get_matches(city_name: str) -> List[CityMeta]:
    get_city_data(city_name)
    return []
