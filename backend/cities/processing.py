from fastapi import HTTPException, status
from geopy.geocoders import Nominatim
from meteostat import Stations, Normals
import pandas as pd


class Processing:
    def __init__(self, city_name: str):
        self.city_name = city_name
        self.coords = None
        self.normals_data = None
        self.cleaned_data = None

    def get_city_coords(self):
        geolocator = Nominatim(user_agent="weather-twin")
        location = geolocator.geocode(self.city_name)

        if location is None:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "City could not be geocoded."
            )
        self.coords = (location.latitude, location.longitude)
        return self

    def get_city_data(self):
        coords = self.coords
        if not coords:
            print("no coords set")
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "no coords set, probably bad chaining",
            )
        stations = Stations().nearby(lat=coords[0], lon=coords[1])
        station = stations.fetch(1)
        normals = Normals(station, 1991, 2020)
        normals_data = normals.fetch()
        if normals_data is None or normals_data.empty:
            print(f"No climate data found for station {station.station_id}")
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                f"No climate data found for station {station.station_id}",
            )
        if "month" not in normals_data.columns and len(normals_data) == 12:
            print("Adding month column to data for station")
            normals_data["month"] = list(range(1, 13))
        elif "month" not in normals_data.columns:
            print("Data for station doesn't have expected structure")
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
            print("No relevant climate metrics found for station ")
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "no relevant climate metrics for station",
            )
        self.normals_data = normals_data
        return self

    def transform_city_data(self):
        normals_data = self.normals_data
        coords = self.coords
        if normals_data is None or not coords:
            print("no normals data set")
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "no normals set, probably bad chaining",
            )

        print("before droipping the normals columsn")

        # drop irrelevant cols
        normals_data = normals_data.drop(["wspd", "pres"], axis=1)
        cleaned_data = {
            "city": self.city_name,
            "lat": coords[0],
            "lng": coords[1],
            "data": normals_data,
        }

        fieldnames = [
            "city",
            "lat",
            "lng",
        ]

        transformed_data = {
            "city": cleaned_data["city"],
            "lat": cleaned_data["lat"],
            "lng": cleaned_data["lng"],
        }

        print("before adding field names")

        # Add columns for each month and metric (except wind speed)
        metrics = ["tavg", "tmin", "tmax", "prcp", "tsun"]
        for month in range(1, 13):
            for metric in metrics:
                fieldnames.append(f"{metric}_{month}")

        # extract data to col per month, flattening the 2d structure
        for _, month_data in cleaned_data["data"].iterrows():
            # Get month as integer
            month_num = int(month_data["month"])

            for metric in metrics:
                if metric in month_data and not pd.isna(month_data[metric]):
                    transformed_data[f"{metric}_{month_num}"] = month_data[metric]

        print("After extracting col data per month")

        print("cleaned data!", transformed_data)
        self.cleaned_data = transformed_data
        return self


#     # Extract metadata separately
#     metadata_cols = ['city', 'station_name', 'lat', 'lng', 'data_completeness']
#     metadata_df = grouped_df[metadata_cols].copy()
#
#     # filter out tavg cols
#     ordered = []
#     for prefix in ['tmin_', 'tmax_', 'prcp_', 'tsun_']:
#     ordered += [col for col in grouped_df.columns if col.startswith(prefix)]
#
#     grouped_df = grouped_df[ordered]
#     grouped_df.head()
#
#
#
#
##### generate mask for city
# from sklearn.preprocessing import MinMaxScaler
# import pandas as pd
# import pickle
# import os
#
# mask_df = grouped_df.notna().astype(int)
# mask_df.columns = ["mask_" + str(col) for col in mask_df.columns]
# masked_input = grouped_df.fillna(0)
#
# # final model input
# model_input = pd.concat([masked_input, mask_df], axis=1)
#
#
# ##### normalize city data
##import pandas as pd
# from sklearn.preprocessing import MinMaxScaler
# import pickle  # or pickle if you prefer
#
# def normalize_and_save(df):
# # Create a copy of the original so we don't modify it in-place
#    df_final = df.copy()
#
#    # Slice the first 60 columns
#    df_first_60 = df_final.iloc[:, :48]
#
#    # Create and fit the MinMaxScaler
#    scaler = MinMaxScaler()
#    scaled_values = scaler.fit_transform(df_first_60)
#
#    # Put scaled values back into the same column positions
#    df_final.iloc[:, :48] = scaled_values
#
#    # Pickle (serialize) the scaler for later use
#    with open("my_minmax_scaler.pkl", "wb") as file:
#        pickle.dump(scaler, file)
#
#    return df_final


# normalized_model_input = normalize_and_save(model_input)
# print(normalized_model_input)
