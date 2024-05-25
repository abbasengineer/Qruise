# Qruise: Optimize Your Drive

Welcome to Qruise! Our application helps you optimize your driving routes by identifying segments suitable for cruise control based on road gradients and traffic conditions. Here's a brief overview of the algorithms we use to make this possible:

## Route Calculation and Display
1. **Google Maps API**: We use the Google Maps API to render the map and calculate the driving route between your start and end locations.
2. **Directions Service**: The Directions Service provides the route, which is then displayed on the map using the Directions Renderer.

## Gradient Calculation
1. **Elevation Data**: We fetch elevation data for the route using the Google Maps Elevation API. This data includes the elevation at various points along the route.
2. **Haversine Distance**: The distance between two points on the Earth is calculated using the Haversine formula, which accounts for the spherical shape of the Earth.
3. **Gradient Calculation**: The gradient between two points is calculated as the change in elevation divided by the distance between the points, expressed as a percentage. This helps us identify segments with a gradient suitable for cruise control (typically less than or equal to 4%).

## Segment Classification
1. **Suitable and Unsuitable Segments**: We classify route segments into suitable and unsuitable for cruise control based on the calculated gradient. Continuous segments with gradients within the acceptable range are marked as suitable, while those outside this range are marked as unsuitable.

## Visualization
1. **Drawing Segments**: The identified segments are drawn on the map. Suitable segments are displayed in green, while unsuitable segments are shown in red.

## Traffic Data
1. **Traffic Conditions**: We also consider real-time traffic conditions, fetched via our traffic data API, to avoid recommending cruise control in congested areas.

By combining these sophisticated algorithms, Qruise ensures you have a smoother and more efficient driving experience. Simply enter your start and end locations, and let Qruise do the rest!
