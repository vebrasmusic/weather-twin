from fastapi import APIRouter

from cities.processing import Processing


router = APIRouter()


@router.get("/matches")
def get_matches(city_name: str):
    processing = (
        Processing(city_name).get_city_coords().get_city_data().transform_city_data()
    )
    return None
