from pathlib import Path
from fastapi import HTTPException, status
import rasterio
import numpy as np
import pandas as pd
import pywikibot as pwb

from cities.schemas import CityData


class MetadataFetcher:
    def __init__(self, metadata_df: pd.DataFrame, embeddings_df: pd.DataFrame) -> None:
        self.koppen_raster = self.get_koppen_raster()
        self.metadata_df = metadata_df
        self.embeddings_df = embeddings_df
        self.final_df = None
        self.koppen_short_code = {
            1: "Af",
            2: "Am",
            3: "Aw",
            4: "BWh",
            5: "BWk",
            6: "BSh",
            7: "BSk",
            8: "Csa",
            9: "Csb",
            10: "Csc",
            11: "Cwa",
            12: "Cwb",
            13: "Cwc",
            14: "Cfa",
            15: "Cfb",
            16: "Cfc",
            17: "Dsa",
            18: "Dsb",
            19: "Dsc",
            20: "Dsd",
            21: "Dwa",
            22: "Dwb",
            23: "Dwc",
            24: "Dwd",
            25: "Dfa",
            26: "Dfb",
            27: "Dfc",
            28: "Dfd",
            29: "ET",
            30: "EF",
        }
        self.koppen_descriptions = {
            "Af": "Tropical rainforest climate with no dry season",
            "Am": "Tropical monsoon climate with a short dry season",
            "Aw": "Tropical savanna climate with a pronounced dry season",
            "BWh": "Hot desert climate",
            "BWk": "Cold desert climate",
            "BSh": "Hot semi-arid climate",
            "BSk": "Cold semi-arid climate",
            "Csa": "Hot-summer Mediterranean climate",
            "Csb": "Warm-summer Mediterranean climate",
            "Csc": "Cold-summer Mediterranean climate",
            "Cwa": "Humid subtropical climate with hot summers and dry winters",
            "Cwb": "Subtropical highland climate with warm summers and dry winters",
            "Cwc": "Cold subtropical highland climate with dry winters",
            "Cfa": "Humid subtropical climate with hot summers and no dry season",
            "Cfb": "Temperate oceanic climate with warm summers and no dry season",
            "Cfc": "Subpolar oceanic climate with cool summers and no dry season",
            "Dsa": "Hot-summer humid continental climate with dry summers",
            "Dsb": "Warm-summer humid continental climate with dry summers",
            "Dsc": "Subarctic climate with dry summers",
            "Dsd": "Extremely cold subarctic climate with dry summers",
            "Dwa": "Hot-summer humid continental climate with dry winters",
            "Dwb": "Warm-summer humid continental climate with dry winters",
            "Dwc": "Subarctic climate with dry winters",
            "Dwd": "Extremely cold subarctic climate with dry winters",
            "Dfa": "Hot-summer humid continental climate with no dry season",
            "Dfb": "Warm-summer humid continental climate with no dry season",
            "Dfc": "Subarctic climate with no dry season",
            "Dfd": "Extremely cold subarctic climate with no dry season",
            "ET": "Tundra climate",
            "EF": "Ice cap climate",
        }

    def get_koppen_raster(self):
        raster_path = Path().cwd().joinpath("cities", "artifacts", "koppen.tif")
        return rasterio.open(raster_path)

    def get_koppen_code(self):
        self.metadata_df["koppen_code"] = "Unknown"
        # Assign Koppen class using lat/lon

        lat = self.metadata_df["lat"]
        lon = self.metadata_df["lng"]
        try:
            row_pix, col_pix = self.koppen_raster.index(lon, lat)
            pixel_value = self.koppen_raster.read(1)[row_pix, col_pix]
            short_code = self.koppen_short_code.get(int(pixel_value), "Unknown")
            self.metadata_df["koppen_code"] = short_code
            self.metadata_df["koppen_description"] = self.koppen_descriptions[
                short_code
            ]
        except Exception:
            self.metadata_df["koppen_code"] = "Unknown"
            self.metadata_df["koppen_description"] = "Unknown"

        return self

    def finalize(self) -> CityData:
        city_data = {}
        city_data["embeddings"] = self.embeddings_df.to_dict("index")[0]
        city_data["metadata"] = self.metadata_df.to_dict("index")[0]

        return CityData(**city_data)

    #     self.final_df = self.embeddings_df.join(self.metadata_df, how="left")
    #     return self
    #
    # def clean_final(self) -> :
    #     final_df = self.final_df
    #     if final_df is None:
    #         raise HTTPException(status.HTTP_404_NOT_FOUND, "No final df to mess with.")

    # def get_city_info(self):
    #     city = self.metadata_df["city"].values[0]


# final_df = embeddings_df.join(metadata_df, how="left")
