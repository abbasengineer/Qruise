function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 34.397, lng: -122.447},
        zoom: 8
    });
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    document.getElementById('routeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateAndDisplayRoute(directionsService, directionsRenderer, map);
    });

}

function calculateAndDisplayRoute(directionsService, directionsRenderer, map) {
    var start = document.getElementById('start').value;
    var end = document.getElementById('end').value;

    directionsService.route(
        {
            origin: start,
            destination: end,
            travelMode: 'DRIVING'
        },
        function(response, status) {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
                var path = response.routes[0].overview_path.map(point => ({
                    lat: point.lat(),
                    lng: point.lng()
                }));

                //console.log('Route Path:', path); // Debugging log
                // Fetch elevation data
                fetchElevationData(path, map);

                // Fetch traffic data
                fetchTrafficData(path);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        }
    );
}
function calculateGradient(point1, point2) {
    const deltaElevation = point2.elevation - point1.elevation;
    const deltaDistance = haversineDistance(point1.location, point2.location);
    return (deltaElevation / deltaDistance) * 100; // Gradient as a percentage
}

function haversineDistance(coords1, coords2) {
    const R = 6371e3; // Earth radius in meters
    const lat1 = coords1.lat * Math.PI / 180;
    const lat2 = coords2.lat * Math.PI / 180;
    const deltaLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const deltaLng = (coords2.lng - coords1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

function getCruiseControlSegments(elevationData) {
    const suitableSegments = [];
    const unsuitableSegments = [];
    let currentSegment = [];
    let isSuitable = true;

    for (let i = 0; i < elevationData.length - 1; i++) {
        const gradient = calculateGradient(elevationData[i], elevationData[i + 1]);
        //console.log(`Gradient between point ${i} and ${i + 1}: ${gradient}%`); // Debugging log

        if (Math.abs(gradient) <= 4) {
            if (!isSuitable && currentSegment.length > 0) {
                unsuitableSegments.push([...currentSegment]);
                currentSegment = [];
            }
            currentSegment.push(elevationData[i]);
            isSuitable = true;
        } else {
            if (isSuitable && currentSegment.length > 0) {
                suitableSegments.push([...currentSegment]);
                currentSegment = [];
            }
            currentSegment.push(elevationData[i]);
            isSuitable = false;
        }
    }

    if (currentSegment.length > 1) {
        if (isSuitable) {
            suitableSegments.push(currentSegment);
        } else {
            unsuitableSegments.push(currentSegment);
        }
    }

    return { suitableSegments, unsuitableSegments };
}

// Example usage with fetched elevation data
function fetchElevationData(path, map) {
    console.log('Fetching elevation data for path:', path); // Debugging log
    fetch('/getElevation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Elevation Data:', data); // Debugging log
        const { suitableSegments, unsuitableSegments } = getCruiseControlSegments(data.results);
        console.log('Suitable Cruise Control Segments:', suitableSegments); // Debugging log
        console.log('Unsuitable Cruise Control Segments:', unsuitableSegments); // Debugging log
        drawSegmentsOnMap(suitableSegments, map, '#00FF00'); // Green for suitable segments
        drawSegmentsOnMap(unsuitableSegments, map, '#FF0000'); // Red for unsuitable segments
    })
    .catch(error => console.error('Error fetching elevation data:', error));
}

function drawSegmentsOnMap(segments, map, color) {
    segments.forEach(segment => {
        const segmentPath = segment.map(point => ({
            lat: point.location.lat,
            lng: point.location.lng
        }));

        const segmentPolyline = new google.maps.Polyline({
            path: segmentPath,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 1.0,
            strokeWeight: 4
        });

        segmentPolyline.setMap(map);
    });
}

function fetchTrafficData(path) {
    fetch('/getTraffic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Traffic Data:', data);
        // Process traffic data here
    })
    .catch(error => console.error('Error fetching traffic data:', error));
}



// Load the map script dynamically
function loadScript() {
    var script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDaC4s3RN5CYycmqCjnQMUAGrgbd9A9EuU&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', loadScript);
