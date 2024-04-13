export const isInsideUS = (lat: number, lng: number) => {
    // Approximate boundaries of the continental United States
    var north = 49.384358;
    var south = 24.396308;
    var east = -66.93457;
    var west = -125.00165;
  
    return lat >= south && lat <= north && lng >= west && lng <= east;
}