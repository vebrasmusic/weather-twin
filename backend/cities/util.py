from math import acos, cos, radians, sin


class Util:
    """
    Assume [lat,lng]
    """

    @staticmethod
    def calculate_great_circle_distance(
        point1: tuple[float, float], point2: tuple[float, float]
    ) -> float:
        """
        Assume earth's radius is 6378 km

        Args:
            point1: tuple[float,float] > assume [lat,lng]
        """
        lat1, lon1 = map(radians, point1)
        lat2, lon2 = map(radians, point2)
        r = 6378  # assuming km
        d = r * acos(
            sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(abs(lon1 - lon2))
        )
        return d
