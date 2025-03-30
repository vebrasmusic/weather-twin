from abc import ABC, abstractmethod
import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

from cities.schemas import CityData

load_dotenv()
api_key = os.getenv("PINECONE_API_KEY")
pc_host = "https://weather-twin-embeddings-31616a9.svc.aped-4627-b74a.pinecone.io"


class VectorDb(ABC):
    @abstractmethod
    def query(self, city_data: CityData):
        pass


class PineconeDb(VectorDb):
    def __init__(self):
        super().__init__()
        self.index = Pinecone(api_key).Index(host=pc_host)

    def query(self, city_data: CityData):
        vec = [
            city_data.embeddings.embed_x,
            city_data.embeddings.embed_y,
            city_data.embeddings.embed_z,
        ]
        query_response = self.index.query(
            namespace="",
            vector=vec,
            top_k=20,
            include_metadata=True,
            include_values=True,
        )
        print(query_response)
