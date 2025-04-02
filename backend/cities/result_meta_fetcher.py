from geopy import Nominatim
from cities.schemas import Address, CityData, PlaceResponse, WeatherTwinResponse
import pycountry


def attach_meta(city_data: CityData) -> CityData:
    city_data.metadata.country = fetch_country(city_data)

    return city_data


def fetch_country(city_data: CityData) -> str:
    geolocator = Nominatim(user_agent="weather-twin")
    location = geolocator.reverse([city_data.metadata.lat, city_data.metadata.lng])
    code = location.raw["address"]["ISO3166-2-lvl4"]
    code = code.split("-")[0]
    country = pycountry.countries.get(alpha_2=code)
    return country.name


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
