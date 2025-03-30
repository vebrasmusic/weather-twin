from pathlib import Path
from fastapi import APIRouter, HTTPException, status

from cities.inference import Inference
from cities.metadata_fetcher import MetadataFetcher
from cities.pinecone import PineconeDb
from cities.processing import Processing
import pandas as pd


router = APIRouter()


@router.get("/matches")
def get_matches(city_name: str):
    processing = (
        Processing(city_name)
        .get_city_coords()
        .get_city_data()
        .transform_city_data()
        .generate_mask()
        .normalize_and_save()
    )
    metadata_df, model_input_df = processing.metadata_df, processing.model_input
    if metadata_df is None or model_input_df is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Either metadata df or model input df is not set, probably wrong chain order.",
        )
    embeddings_df = Inference(metadata_df, model_input_df).get_embeddings()
    city_data = MetadataFetcher(metadata_df, embeddings_df).get_koppen_code().finalize()
    res = PineconeDb().query(city_data)
    return None
