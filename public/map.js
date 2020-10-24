let map;
let place_ids;
let autocomplete;
let locations;
let ratings;
let startingLocation;
let transportType = 'BICYCLING';

function main() {
    initMap();
    // drawLine();
    // getPlaces(33.080056, -96.752313, 2000);
    searchPlaces();
}

const KEY = 'AIzaSyChmgzgxmgqxLW01TUjgUoZfs_WLDTR3X8';

// gets places of interest to draw, passes these places to choosePoints
function getPlaces(latitude, longitude, radius) {
    initMap(); // to erase previous routes
    const type = ['tourist_attraction', 'primary_school', 'park'];
    place_ids = [];
    locations = [];
    ratings = [];
    for (let t = 0; t < 3; t++) {
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
                    ratings.push(results[i].rating);
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

    var hullData = convexHull(locations);

    let closestPlace = 0;
    let minDist = Number.POSITIVE_INFINITY;
    let minRating = 0;
    let ratingIndex = 0;
    let prevRatingIndex = 0;
    hullData.hull.forEach(function (place, index) {
        createMarker(place, "hull");
        let dist = Math.hypot(place.lat - startingLocation.lat, place.lng - startingLocation.lng);
        if (minDist > dist) {
            minDist = dist;
            closestPlace = index;
        }
        if (minRating > hullData.hull_ratings[index]) {
            prevRatingIndex = ratingIndex;
            ratingIndex = index;
            minRating = hullData.hull_ratings[index];
        }
    });



    hullData.hull = hullData.hull.slice(closestPlace, hullData.hull.length).concat(hullData.hull.slice(0, closestPlace));
    hullData.hull = hullData.hull.slice(0, Math.min(25, hullData.hull.length));
    waypoints = []
    hullData.hull.forEach(function (item) {
        waypoints.push({
            location: item,
            stopover: false,
        });
    });

    drawDirections({ location: startingLocation }, { location: startingLocation }, waypoints, transportType);
}

// gets and draws the directions on the map
function drawDirections(origin, destination, waypoints, mode) {
    const request = {
        destination: destination,   //google.maps.Place interface
        origin: origin,             //google.maps.Place interface
        travelMode: mode,
        // optimizeWaypoints: true,
        waypoints: waypoints,       // Array<DirectionsWaypoint>
    };
    var totalPathPoints = [];
    totalPathPoints.push(origin);
    totalPathPoints.push(waypoints);
    totalPathPoints.push(destination);
    console.log(totalPathPoints);
    renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        draggable: true,
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
        updateTransportType();

        startingLocation = place.geometry.location.toJSON();
        let r = 2000;
        let centerCoord = computeOffset(startingLocation, r, Math.random() * Math.PI * 2);
        getPlaces(centerCoord.lat, centerCoord.lng, r);

        // var high1 = document.getElementById("highlightOne");
        // high1.src = "https://www.pisd.edu/cms/lib/TX02215173/Centricity/Domain/1115/Mathews%20facade.jpg";
        // var high2 = document.getElementById("highlightTwo");
        // high2.src = "https://www.pisd.edu/cms/lib/TX02215173/Centricity/Domain/1115/Mathews%20facade.jpg";
    });
}

function getHighlights() {
    var high1 = document.getElementById("highlightOne");
    var high2 = document.getElementById("highlightTwo");
}

function updateTransportType() {
    transportType = document.getElementById("transportTypeSelect").value;
    console.log(transportType);
}



function convexHull(points) {
    if (points.length < 3) {
        return points;
    }
    hull = [];
    hull_ids = [];
    hull_ratings = [];

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
        hull_ratings.push(ratings[p]);

        q = (p + 1) % points.length;
        for (let i = 0; i < points.length; i++) {
            if (orientationNum(points[p], points[i], points[q]) == 2)
                q = i;
        }

        p = q;

    } while (p != leftmost);

    return { hull: hull, hull_ids: hull_ids, hull_ratings: hull_ratings };
}

function orientationNum(p, q, r) {
    let val = (q.lng - p.lng) * (r.lat - q.lat) - (q.lat - p.lat) * (r.lng - q.lng);
    return ((val == 0) ? 0 : ((val > 0) ? 1 : 2));
}

function getElevation() {

}