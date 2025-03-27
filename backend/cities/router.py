from typing import List
from fastapi import APIRouter
from .processing import get_city_data
from .schemas import CityData, Embeddings, CityMeta

router = APIRouter()


@router.get("/matches")
def get_matches(city_name: str):
    return get_city_data(city_name)
