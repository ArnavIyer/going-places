let map;

function main() {
    initMap();
    drawLine();
    getPlaces(33.080056, -96.752313, 5000, 'tourist_attraction');
}

const KEY = 'AIzaSyChmgzgxmgqxLW01TUjgUoZfs_WLDTR3X8';

function getPlaces(latitude, longitude, radius, type) {
    const base = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='

    let url = base + latitude + ',' + longitude + '&radius=' + radius + '&type=' + type + '&key=' + KEY;

    const request = {
        location: {lat: latitude, lng: longitude},
        radius: radius,
        type: type
    };
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }
            map.setCenter(results[0].geometry.location);
        }
    });
}

function createMarker(place) {
    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
    });
    google.maps.event.addListener(marker, "click", () => {
        infowindow.setContent(place.name);
        infowindow.open(map);
    });
}

/*

*/

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 30.2672, lng: -97.7431 },
        zoom: 12,
    });
    console.log('test');

    // markers = locations.map((location, i) => {
    //     return new google.maps.Marker({
    //         position: location,
    //         label: 'A',
    //     })
    // })

    // new MarkerClusterer(map, markers, {
    // 
    // })
}

function drawLine() {
    const flightPlanCoordinates = [
        { lat: 37.772, lng: -122.214 },
        { lat: 21.291, lng: -157.821 },
        { lat: -18.142, lng: 178.431 },
        { lat: -27.467, lng: 153.027 },
    ];
    const flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });
    flightPath.setMap(map);
}