let map;
let place_ids;
let autocomplete;
let locations;
let startingLocation;

function main() {
    initMap();
    drawLine();
    // getPlaces(33.080056, -96.752313, 2000);
    searchPlaces();
}

const KEY = 'AIzaSyChmgzgxmgqxLW01TUjgUoZfs_WLDTR3X8';

// gets places of interest to draw, passes these places to choosePoints
function getPlaces(latitude, longitude, radius) {
    const type = ['tourist_attraction', 'primary_school', 'park'];
    place_ids = [];
    locations = [];
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
                    place_ids.push(results[i].place_id);
                    locations.push(results[i].geometry.location.toJSON());
                    // createMarker(results[i].geometry.location, results[i].name);
                }
                map.setCenter(request.location);
            }
        });
    }
    console.log(locations);
    setTimeout(() => { choosePoints(place_ids, locations); }, 2000); // how do i make this without a wait? this can only execute after we get all the place ids and locations
}

// chooses points and passes them to drawDirections
function choosePoints(place_ids, locations) {
    // waypoints.push({location: {lat: 33.086184, lng: -96.746869}, stopover: false});
    // get the points in the convex hull in order

    var hullData = convexHull(locations);

    console.log(hullData);

    hullData.hull.forEach(function (item) {
        createMarker(item, "hull");
    })

    let closestPlace = 0;
    let minDist = Number.POSITIVE_INFINITY
    hullData.hull.forEach(function (place, index) {
        let dist = Math.hypot(place.lat - startingLocation.lat, place.lng - startingLocation.lng);
        if (minDist > dist) {
            minDist = dist;
            closestPlace = index;
        }
    });

    hullData.hull = hullData.hull.slice(closestPlace, hullData.hull.length).concat(hullData.hull.slice(0, closestPlace));
    waypoints = []
    hullData.hull.forEach(function (item) {
        waypoints.push({
            location: item,
            stopover: false,
        });
    });

    drawDirections({ location: startingLocation }, { location: startingLocation }, waypoints, 'BICYCLING');
}

// gets and draws the directions on the map
function drawDirections(origin, destination, waypoints, mode) {
    // console.log(waypoints);
    // const base = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?origin='

    // let url = base + 'place_id:' + origin + '&destination=place_id:' + destination + '&mode=' + mode + '&key=' + KEY;

    const request = {
        destination: destination,   //google.maps.Place interface
        origin: origin,             //google.maps.Place interface
        travelMode: mode,
        // optimizeWaypoints: true,
        waypoints: waypoints,       // Array<DirectionsWaypoint>
    };
    renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
    });
    renderer.setMap(map);
    service = new google.maps.DirectionsService();      // https://developers.google.com/maps/documentation/javascript/reference/directions
    service.route(request, (results, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            renderer.setDirections(results);
        }
    });
}

function createMarker(location, name) {
    const marker = new google.maps.Marker({
        map,
        position: location,
    });
    google.maps.event.addListener(marker, "click", () => {
        infowindow.setContent(name);
        infowindow.open(map);
    });
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 30.2672, lng: -97.7431 },
        zoom: 12,
    });
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

function computeOffset(from, distance, heading) {
    distance /= 6371009.0;  //earth_radius = 6371009 # in meters
    let fromLat = from.lat * Math.PI / 180.0;
    let fromLng = from.lng * Math.PI / 180.0;
    let cosDistance = Math.cos(distance);
    let sinDistance = Math.sin(distance);
    let sinFromLat = Math.sin(fromLat);
    let cosFromLat = Math.cos(fromLat);
    let sinLat = cosDistance * sinFromLat + sinDistance * cosFromLat * Math.cos(heading);
    let dLng = Math.atan2(sinDistance * cosFromLat * Math.sin(heading), cosDistance - sinFromLat * sinLat);
    return {lat:Math.asin(sinLat) * 180 / Math.PI, lng:(fromLng + dLng) * 180 / Math.PI};
}

function searchPlaces() {
    var input = document.getElementById('locationInput');
    autocomplete = new google.maps.places.Autocomplete(input, {});

    console.log('test');

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();

        startingLocation = place.geometry.location.toJSON();
        let r = 2000;
        let centerCoord = computeOffset(startingLocation, r, Math.random() * Math.PI * 2);
        getPlaces(centerCoord.lat, centerCoord.lng, r);

        console.log(place)
    });

    let button = document.getElementById("submit");

    button.addEventListener("click", () => {
        // getPlaces(startingLocation.lat, startingLocation.lng, 2000);
    });
}
function convexHull(points) {
    if (points.length < 3) {
        return points;
    }
    hull = [];
    hull_ids = [];

    var leftmost = 0;
    for (let i = 0; i < points.length; i++) {
        if (points[i].lat < points[leftmost].lat) {
            leftmost = i;
        }
    }

    let p = leftmost;
    let q;
    do {
        hull.push(points[p]);
        hull_ids.push(place_ids[p]);

        q = (p + 1) % points.length;
        for (let i = 0; i < points.length; i++) {
            if (orientationNum(points[p], points[i], points[q]) == 2)
                q = i;
        }

        p = q;

    } while (p != leftmost);

    return { hull: hull, hull_ids: hull_ids };
}

function orientationNum(p, q, r) {
    let val = (q.lng - p.lng) * (r.lat - q.lat) - (q.lat - p.lat) * (r.lng - q.lng);
    return ((val == 0) ? 0 : ((val > 0) ? 1 : 2));
}
