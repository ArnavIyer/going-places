let map;
let place_ids;
let autocomplete;

function main() {
    initMap();
    drawLine();
    getPlaces(33.080056, -96.752313, 2000);
    searchPlaces();
}

const KEY = 'AIzaSyChmgzgxmgqxLW01TUjgUoZfs_WLDTR3X8';

// gets places of interest to draw, passes these places to choosePoints
function getPlaces(latitude, longitude, radius) {
    const type = ['tourist_attraction', 'primary_school', 'park'];
    place_ids = [];
    for (let t = 0; t < 3; t++) {
        // const base = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='

        // let url = base + latitude + ',' + longitude + '&radius=' + radius + '&type=' + type[t] + '&key=' + KEY;

        const request = {
            location: { lat: latitude, lng: longitude },
            radius: radius,
            type: type[t]
        };
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (let i = 0; i < results.length; i++) {
                    if (place_ids.length > 2) break;
                    place_ids.push(results[i].place_id);
                    createMarker(results[i]);
                }
                map.setCenter(request.location);
            }
        });
    }
    setTimeout(() => { choosePoints(place_ids); }, 2000);
}

// chooses points and passes them to drawDirections
function choosePoints(place_ids) {
    // just to test drawDirections
    var waypoints = [];
    waypoints.push({ location: place_ids[2], stopover: true });
    drawDirections({ placeId: place_ids[0] }, { placeId: place_ids[1] }, waypoints, 'BICYCLING');
}

function drawDirections(origin, destination, waypoints, mode) {
    console.log(origin);
    // const base = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?origin='

    // let url = base + 'place_id:' + origin + '&destination=place_id:' + destination + '&mode=' + mode + '&key=' + KEY;

    const request = {
        destination: destination,   //google.maps.Place interface
        origin: origin,             //google.maps.Place interface
        travelMode: mode,
        // optimizeWaypoints: true,
        // waypoints: waypoints,       // Array<DirectionsWaypoint>
    };
    renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
    });
    renderer.setMap(map);
    service = new google.maps.DirectionsService();      // https://developers.google.com/maps/documentation/javascript/reference/directions
    service.route(request, (results, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            console.log(results);
            renderer.setDirections(results);
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

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 30.2672, lng: -97.7431 },
        zoom: 12,
    });
    console.log('test');
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

function searchPlaces() {
    var input = document.getElementById('locationInput');
    autocomplete = new google.maps.places.Autocomplete(input, {});

    console.log('test');

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();

        console.log(place)
    });
}
