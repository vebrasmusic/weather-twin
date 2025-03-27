from fastapi import HTTPException, status
from geopy.geocoders import Nominatim


def get_city_data(city_name: str):
    geolocator = Nominatim(user_agent="weather-twin")
    location = geolocator.geocode(city_name)

    if location is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "City could not be geocoded.")
    print("Location from Nominatim", location)
    return location.latitude, location.longitude

    # location.latitude

    # clean data


#
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
