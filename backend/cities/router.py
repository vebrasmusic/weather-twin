from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, status
from cities.inference import Inference
from cities.metadata_fetcher import MetadataFetcher
from cities.pinecone import PineconeDb
from cities.processing import Processing
from cities.result_meta_fetcher import attach_meta
from cities.schemas import WeatherTwinResponse
from cities.websocket import ConnectionManager
import asyncio

router = APIRouter(prefix="/api")

manager = ConnectionManager()


@router.get("/matches")
async def get_matches(city_name: str, request_id: str) -> WeatherTwinResponse:
    """
    actual requester for city data. need to send the request id that ties a websocket conn to each request, so i know who to send it to
    """
    await manager.send_message("Processing input city data...", request_id)
    await asyncio.sleep(0)  # yield control so FastAPI can flush this out
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

    await manager.send_message("Running data through autoencoder...", request_id)
    await asyncio.sleep(0)  # yield control so FastAPI can flush this out
    embeddings_df = Inference(metadata_df, model_input_df).get_embeddings()

    await manager.send_message("Getting some info for input...", request_id)
    await asyncio.sleep(0)  # yield control so FastAPI can flush this out
    city_data = MetadataFetcher(metadata_df, embeddings_df).get_koppen_code().finalize()

    await manager.send_message("Fetching similar cities...", request_id)
    await asyncio.sleep(0)  # yield control so FastAPI can flush this out
    input_city, match_cities = PineconeDb().query(city_data)

    await manager.send_message("Fetching metadata for input...", request_id)
    await asyncio.sleep(0)  # yield control so FastAPI can flush this out
    input_city = attach_meta(input_city)

    await manager.send_message("Fetching metadata for matches...", request_id)
    await asyncio.sleep(0)  # yield control so FastAPI can flush this out
    match_cities = [attach_meta(match_city) for match_city in match_cities]

    await manager.send_message("Finishing up...", request_id)
    await asyncio.sleep(0)  # yield control so FastAPI can flush this out
    resp = WeatherTwinResponse(input=input_city, matches=match_cities)
    return resp


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, request_id: str):
    """
    init websocket conn, add to the connection manager so we know who to send the actual result data too later.
    """
    try:
        await manager.connect(websocket, request_id)

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(request_id)
    except Exception as e:
        print(f"[Backend] WebSocket error for request_id: {request_id}")
        print(f"   Error: {str(e)}")
        manager.disconnect(request_id)
