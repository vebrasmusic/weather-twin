from fastapi import HTTPException, status
from geopy.geocoders import Nominatim
from meteostat import Stations, Normals
import pandas as pd
import pickle
from pathlib import Path

from cities.websocket import ConnectionManager


class Processing:
    def __init__(self, city_name: str):
        self.city_name = city_name
        self.coords = None
        self.normals_data = None
        self.cleaned_data = None
        self.metadata_df = None
        self.model_input = None

    def get_city_coords(self):
        geolocator = Nominatim(user_agent="weather-twin")
        location = geolocator.geocode(self.city_name)

        if location is None:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "Couldn't find that city. Please check the spelling and try again."
            )
        self.coords = (location.latitude, location.longitude)
        return self

    def get_city_data(self):
        coords = self.coords
        if not coords:
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "no coords set, probably bad chaining",
            )
        stations = Stations().nearby(lat=coords[0], lon=coords[1])
        station = stations.fetch(1)
        normals = Normals(station, 1991, 2020)
        normals_data = normals.fetch()
        if normals_data is None or normals_data.empty:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Couldn't find initial climate data for that city. Please try a different city or a larger nearby city.",
            )
        if "month" not in normals_data.columns and len(normals_data) == 12:
            normals_data["month"] = list(range(1, 13))
        elif "month" not in normals_data.columns:
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "station data has unexpected structure",
            )

        # Make sure month is an integer
        normals_data["month"] = normals_data["month"].astype(int)

        # Check data completeness for relevant columns (excluding wind speed)
        relevant_columns = ["tavg", "tmin", "tmax", "prcp", "tsun"]
        relevant_columns = [
            col for col in relevant_columns if col in normals_data.columns
        ]

        if not relevant_columns:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Not enough climate data available for that city. Please try a different city.",
            )
        self.normals_data = normals_data
        return self

    def transform_city_data(self):
        normals_data = self.normals_data
        coords = self.coords
        if normals_data is None or not coords:
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "no normals set, probably bad chaining",
            )

        # drop irrelevant cols
        normals_data = normals_data.drop(["wspd", "pres", "tavg"], axis=1)
        cleaned_data = {
            "city": self.city_name,
            "lat": coords[0],
            "lng": coords[1],
            "data": normals_data,
        }

        transformed_data = {
            "city": cleaned_data["city"],
            "lat": cleaned_data["lat"],
            "lng": cleaned_data["lng"],
        }

        metrics = ["tmin", "tmax", "prcp", "tsun"]

        for _, month_data in cleaned_data["data"].iterrows():
            # Get month as integer
            month_num = int(month_data["month"])

            for metric in metrics:
                if metric in month_data:
                    transformed_data[f"{metric}_{month_num}"] = month_data[metric]

        transformed_data = pd.DataFrame([transformed_data])
        self.cleaned_data = transformed_data
        return self

    def generate_mask(self):
        grouped_df = self.cleaned_data
        if grouped_df is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Didn't set cleaned_data")
        # Extract metadata separately
        metadata_cols = ["city", "lat", "lng"]
        metadata_df = grouped_df.filter(metadata_cols)
        self.metadata_df = metadata_df

        ordered = []
        for prefix in ["tmin_", "tmax_", "prcp_", "tsun_"]:
            ordered += [col for col in grouped_df.columns if col.startswith(prefix)]

        grouped_df = grouped_df[ordered]
        mask_df = grouped_df.notna().astype(int)
        mask_df.columns = ["mask_" + str(col) for col in mask_df.columns]
        masked_input = grouped_df.fillna(0)

        model_input = pd.concat([masked_input, mask_df], axis=1)
        self.model_input = model_input
        return self

    def normalize_and_save(self):
        model_input = self.model_input
        if model_input is None:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "Didn't set initial model input"
            )
        copy_df = model_input.copy()

        pickle_path = (
            Path().cwd().joinpath("cities", "artifacts", "my_minmax_scaler.pkl")
        )
        with open(pickle_path, "rb") as file:
            scaler = pickle.load(file)

        # Slice the first 48 columns
        df_first_48 = copy_df.iloc[:, :48]

        scaled_values = scaler.transform(df_first_48)

        # Put scaled values back into the same column positions
        copy_df.iloc[:, :48] = scaled_values

        self.model_input = copy_df
        return self
