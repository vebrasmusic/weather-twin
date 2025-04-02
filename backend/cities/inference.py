from pathlib import Path
from pandas import DataFrame
import pandas as pd
import torch
from cities.models import Autoencoder
from cities.schemas import CityData, Embeddings


class Inference:
    def __init__(self, metadata_df: DataFrame, model_input_df: DataFrame) -> None:
        self.metadata_df = metadata_df
        self.model_input_df = model_input_df
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self.init_model()

    def init_model(self):
        model = Autoencoder().to(self.device)
        model_path = Path.cwd().joinpath(
            "cities", "artifacts", "autoencoder_cities.pth"
        )
        model.load_state_dict(torch.load(model_path, map_location=self.device))
        model.eval()
        return model

    def get_embeddings(self) -> DataFrame:
        input_tensor = torch.tensor(self.model_input_df.values, dtype=torch.float32).to(
            self.device
        )

        with torch.no_grad():
            _, embeddings = self.model(input_tensor)
            embeddings_np = embeddings.cpu().numpy()
            embeddings_df = pd.DataFrame(
                embeddings_np,
                columns=["embed_x", "embed_y", "embed_z"],
                index=self.model_input_df.index,
            )
        return embeddings_df
