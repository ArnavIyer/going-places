let map;
let autocomplete;
let locations;
let startingLocation;
let photos;
let names;
let radius = 750;
let transportType = "WALKING";
let place;

const ws = new WebSocket("ws://localhost:9099");

function main() {
    document.getElementById('route-metrics').hidden = true;
    initMap();
    searchPlaces();
}

const KEY = 'AIzaSyChmgzgxmgqxLW01TUjgUoZfs_WLDTR3X8';

// gets places of interest to draw, passes these places to choosePoints
function getPlaces(latitude, longitude, radius) {
    initMap(); // to erase previous routes
    const type = ['tourist_attraction', 'primary_school', 'park'];
    locations = [];
    photos = [];
    names = [];
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
                    locations.push(results[i].geometry.location.toJSON());
                    if (typeof(results[i].photos) == "undefined") {
                        photos.push("");
                    } else {
                        photos.push(results[i].photos[0].getUrl());
                    }
                    names.push(results[i].name);
                }
                map.setCenter(request.location);
            }
        });
    }
    setTimeout(() => { choosePoints(locations); }, 2000); // how do i make this without a wait? this can only execute after we get all the place ids and locations
}

// chooses points and passes them to drawDirections
function choosePoints(locations) {
    console.log(names);
    var hullData = convexHull(locations);

    let closestPlace = 0;
    let minDist = Number.POSITIVE_INFINITY;
    hullData.hull.forEach(function (place, index) {
        createMarker(place, "hull");
        let dist = Math.hypot(place.lat - startingLocation.lat, place.lng - startingLocation.lng);
        if (minDist > dist) {
            minDist = dist;
            closestPlace = index;
        }
    });

    finalPhotos = [];
    finalNames = [];

    hullData.hull_photos.forEach(function(url, i) {
        ws.send(url);
        ws.addEventListener("message", e => {
            if (e.data) {
                finalPhotos.push(url);
                finalNames.push(hullData.hull_names[i]);
            }
        });
    });

    // fillCarousel(finalNames, finalPhotos);

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
        avoidHighways: true,
        waypoints: waypoints,       // Array<DirectionsWaypoint>
    };
    var totalPathPoints = [];
    totalPathPoints.push(origin.location);
    waypoints.forEach(item => {
        totalPathPoints.push(item.location)
        console.log(item.location);
    });
    totalPathPoints.push(destination.location);
    getElevation(totalPathPoints);
    renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        suppressBicyclingLayer: true,
        draggable: true,
    });
    renderer.setMap(map);
    service = new google.maps.DirectionsService();      // https://developers.google.com/maps/documentation/javascript/reference/directions
    service.route(request, (results, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            renderer.setDirections(results);
            let leg = results.routes[0].legs[0];
            document.getElementById("distance").innerHTML = leg.distance.text;
            document.getElementById("time").innerHTML = leg.duration.text;
        }
    });
    document.getElementById('route-metrics').hidden = false;
    new google.maps.Marker({
        position: origin.location,
        map,
        title: "Starting Position",
        label: 'S'
    });
}

function fillCarousel(names, photos) {
    photosHTML = "";
    active = " active";
    photos.forEach(function(photo, i) {
        if (photo != "") {
            photosHTML += "<div class=\"carousel-item\"><img class=\"d-block w-100\" src=" + photo + " alt=\"Third slide\"><div class=\"carousel-caption d-none d-md-block\">   <p>" + names[i] + "</p></div></div>";
        }
    });
    document.getElementById("carousel-items").innerHTML = photosHTML.slice(0,25) + active + photosHTML.slice(25);
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
        place = autocomplete.getPlace();
        startingLocation = place.geometry.location.toJSON();
        updateTransportType();
        updateRadius();
    });

    button = document.getElementById('submit');
    button.addEventListener('click', function() {
        if(place === undefined) {
            return;
        }
        if(startingLocation === undefined) {
            return;
        }
        document.getElementById("locationInput").innerHTML = location.formatted_address;
        let centerCoord = computeOffset(startingLocation, radius, Math.random() * Math.PI * 2);
        getPlaces(centerCoord.lat, centerCoord.lng, radius);
    });
}

function updateTransportType() {
    transportType = document.getElementById("transportTypeSelect").value;
    console.log(transportType);
}

function updateRadius() {
    radius = document.getElementById("radiusInput").value;
    // radius = (radius * MILESTOM) / (2 * Math.PI);
    console.log(radius);
}

function convexHull(points) {
    if (points.length < 3) {
        return points;
    }
    hull = [];
    hull_photos = [];
    hull_names = [];

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
        hull_photos.push(photos[p]);
        hull_names.push(names[p]);

        q = (p + 1) % points.length;
        for (let i = 0; i < points.length; i++) {
            if (orientationNum(points[p], points[i], points[q]) == 2)
                q = i;
        }

        p = q;

    } while (p != leftmost);

    return { hull: hull, hull_photos: hull_photos, hull_names: hull_names};
}

function orientationNum(p, q, r) {
    let val = (q.lng - p.lng) * (r.lat - q.lat) - (q.lat - p.lat) * (r.lng - q.lng);
    return ((val == 0) ? 0 : ((val > 0) ? 1 : 2));
}

function getElevation(path) {
    const elevator = new google.maps.ElevationService();
    console.log(path);
    elevator.getElevationForLocations(
    {
        locations: path,
    }, (res, status) => {      
        console.log(res);  
        let startElevation = res[0].elevation;
        let sum = 0;
        for(let i = 1; i < res.length; ++i) {
            sum += res[i].elevation - startElevation;
        }
        document.getElementById("elevation").innerHTML = (sum / (res.length - 1)).toFixed(2);
    });
}

// google cloud stuff

// function quickstart() {
//     const client = new vision.ImageAnnotatorClient();
// }