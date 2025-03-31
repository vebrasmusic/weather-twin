from abc import ABC, abstractmethod
import os
from typing import List
from numpy import sort
from pinecone import Pinecone, QueryResponse, ServerlessSpec
from dotenv import load_dotenv
from cities.util import Util

from cities.schemas import CityData, PineconeQueryMatch, PineconeQueryResponse

load_dotenv()
api_key = os.getenv("PINECONE_API_KEY")
pc_host = "https://weather-twin-embeddings-31616a9.svc.aped-4627-b74a.pinecone.io"


class VectorDb(ABC):
    @abstractmethod
    def query(self, city_data: CityData):
        pass


def sort_key(match: PineconeQueryMatch):
    return match.score


class PineconeDb(VectorDb):
    def __init__(self):
        super().__init__()
        self.index = Pinecone(api_key).Index(host=pc_host)

    def filter_query(
        self, pcqr: PineconeQueryResponse, city_data: CityData
    ) -> list[PineconeQueryMatch]:
        min_distance = 5000
        filtered_matches = []
        point1 = (city_data.metadata.lat, city_data.metadata.lng)
        for match in pcqr.matches:
            point2 = (match.metadata.lat, match.metadata.lng)
            distance = Util.calculate_great_circle_distance(point1, point2)
            if distance > min_distance:
                filtered_matches.append(match)

        filtered_matches.sort(key=sort_key, reverse=True)
        return filtered_matches[0:3]

    def transform_match(self, matches: list[PineconeQueryMatch]) -> list[CityData]:
        transformed_matches = []
        for match in matches:
            match_dict = {
                "embeddings": {
                    "embed_x": match.values[0],
                    "embed_y": match.values[1],
                    "embed_z": match.values[2],
                },
                "metadata": match.metadata,
                "score": match.score,
            }
            match_city = CityData(**match_dict)
            transformed_matches.append(match_city)
        return transformed_matches

    def query(self, city_data: CityData):
        vec = [
            city_data.embeddings.embed_x,
            city_data.embeddings.embed_y,
            city_data.embeddings.embed_z,
        ]
        query_response = self.index.query(
            namespace="",
            vector=vec,
            top_k=100,
            include_metadata=True,
            include_values=True,
        )
        pcqr = PineconeQueryResponse(**query_response.to_dict())
        filtered_matches = self.filter_query(pcqr, city_data)
        match_cities = self.transform_match(filtered_matches)
        print(match_cities)
