from geopy import Nominatim
from meteostat import Normals, Stations
import requests
from cities.schemas import Address, CityData, PlaceResponse, Stats, WeatherTwinResponse
import pycountry

geolocator = Nominatim(user_agent="weather-twin")


def attach_meta(city_data: CityData) -> CityData:
    city_data.metadata.country = fetch_country(city_data)
    stats = fetch_weather(city_data)
    if stats is not None:
        stats = Stats(**stats)
        city_data.metadata.stats = stats
    city_data.metadata.description = fetch_description(city_data)
    return city_data


def fetch_country(city_data: CityData) -> str:
    location = geolocator.reverse([city_data.metadata.lat, city_data.metadata.lng])
    code = location.raw["address"]["ISO3166-2-lvl4"]
    code = code.split("-")[0]
    country = pycountry.countries.get(alpha_2=code)
    return country.name


def fetch_weather(city_data: CityData):
    stations = Stations().nearby(lat=city_data.metadata.lat, lon=city_data.metadata.lng)
    station = stations.fetch(1)
    normals = Normals(station, 1991, 2020)
    normals_data = normals.fetch()
    if normals_data is None or normals_data.empty:
        print("no data for that.. not sure how we got this far")
        return {
            "temp": None,
            "pressure": None,
            "windspeed": None,
            "rainfall": None,
        }
    normals_data = normals_data.fillna(value=-1)
    normals_dict = normals_data.to_dict(orient="list")

    def safe_stat(key):
        values = normals_dict.get(key, [])
        if not values or all(v == -1 for v in values):
            return None
        min_val, max_val = min(values), max(values)
        return None if min_val == -1 or max_val == -1 else [min_val, max_val]

    stats = {
        "temp": safe_stat("tavg"),
        "rainfall": safe_stat("prcp"),
        "pressure": safe_stat("pres"),
        "windspeed": safe_stat("wspd"),
    }
    return stats


def fetch_description(city_data: CityData):
    url = (
        "https://en.wikipedia.org/api/rest_v1/page/summary/"
        + city_data.metadata.city.replace(" ", "_")
    )
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        return data.get("extract", "No summary found.")
    else:
        return "Could not fetch summary."


#
#
#     class Address(BaseModel):
#     neighbourhood: str
#     suburb: str
#     city: str
#     county: str
#     state: str
#     ISO3166_2_lvl4: str
#     postcode: str
#     country: str
#     country_code: str
#
#
# class PlaceResponse(BaseModel):
#     place_id: int
#     licence: str
#     osm_type: str
#     osm_id: int
#     lat: str
#     lon: str
#     place_class: str = Field(..., alias="class")
#     place_type: str = Field(..., alias="type")
#     place_rank: int
#     importance: float
#     addresstype: str
#     name: str
#     display_name: str
#     address: Address
#     boundingbox: list[str]
