// ------------------------------------- global -------------------------------------------------------

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.response;
}

function jsonToArray(json) {
    var array = [];
    array.push(json.lat);
    array.push(json.lng);
    return array;
}

function roundNumber(num, dec) {
    const [sv, ev] = num.toString().split('e');
    return Number(
        Number(Math.round(parseFloat(sv + 'e' + dec)) + 'e-' + dec) +
            'e' +
            (ev || 0)
    );
}

var totalcost = 0;
// ------------------------------------- /global -------------------------------------------------------

// ------------------------------------- map -------------------------------------------------------

var markers = [];
var markersLocal = [];
let markersPosition = [];
let distance;

function initialize() {
    initMap();
    initAutocomplete();
}

let map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 55.754652859190074, lng: 37.62576896153753 },
        zoom: 10,
        gestureHandling: 'greedy',
        streetViewControl: false,
        mapTypeControl: true,
    });

    map.addListener('click', (e) => {
        clear();
        markers.push(placeMarkerAndPanTo(e.latLng, map));
        getAdressAndDistance();
    });
}

// ----------------------------- search box ---------------------------------------

function initAutocomplete() {
    // Create the search box and link it to the UI element.
    const input = document.getElementById('pac-input');
    const searchBox = new google.maps.places.SearchBox(input);
    
    var input2 = document.getElementById('pac-inputTwo');
    const searchBox2 = new google.maps.places.SearchBox(input2);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds());
        searchBox2.setBounds(map.getBounds());
    });
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.

    
    searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markersLocal.
        markersLocal.forEach((marker) => {
            marker.setMap(null);
        });
        markersLocal = [];

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
            if (!place.geometry) {
                console.log('Returned place contains no geometry');
                return;
            }
            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };

            // Create a marker for each place.
            markersLocal.push(
                new google.maps.Marker({
                    map,
                    title: place.name,
                    position: place.geometry.location,
                })
            );

            // -------------------------------------------------------

            clear();
            markers.push(
                placeMarkerAndPanTo(markersLocal[0].getPosition(), map)
            );
            getAdressAndDistance();

            // -------------------------------------------------------

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    searchBox2.addListener('places_changed', () => {
        const places = searchBox2.getPlaces();

        if (places.length == 0) {
            return;
        }
        // Clear out the old markersLocal.
        markersLocal.forEach((marker) => {
            marker.setMap(null);
        });
        markersLocal = [];
        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
            if (!place.geometry) {
                console.log('Returned place contains no geometry');
                return;
            }
            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };
            // Create a marker for each place.
            markersLocal.push(
                new google.maps.Marker({
                    map,
                    title: place.name,
                    position: place.geometry.location,
                })
            );

            // -------------------------------------------------------

            clear();
            markers.push(
                placeMarkerAndPanTo(markersLocal[0].getPosition(), map)
            );
            getAdressAndDistance();

            // -------------------------------------------------------

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

// ----------------------------- /search box ---------------------------------------

function clear() {
    if (markers.length > 1) {
        // Clear out the old markers on the map.

        markers.forEach((marker) => {
            marker.setMap(null);
        });

        markersLocal.forEach((marker) => {
            marker.setMap(null);
        });

        markers = [];
        markersPosition = [];
        adress1 = '';
        adress2 = '';
        distance = 0;
        // document.getElementById('point2').innerHTML = ''; // адрес второй точки
        // document.getElementById('secondData').innerHTML = ''; // Ваша вторая точка:
        document.getElementById('distance').innerHTML = ''; // Расстояние
        document.getElementById('pac-input').value = '';
        document.getElementById('pac-inputTwo').value = '';
    }
}

var adress1 = '';
var adress2 = '';
function getAdressAndDistance() {
    // does all the work.
    // gets coordinates of 2 markers
    // and counting distance

    if (markers.length < 2) {
        var marPos = markers[0].getPosition().toJSON();
        markersPosition.push(jsonToArray(marPos));

        adress1 = geocode(markersPosition[0]);
        document.getElementById('pac-input').value = adress1;
    }

    if (markers.length == 2) {
        var marPos = markers[1].getPosition().toJSON();
        markersPosition.push(jsonToArray(marPos));

        adress2 = geocode(markersPosition[1]);
        document.getElementById('pac-inputTwo').value = adress2;

        marker1 = markers[0].getPosition();
        marker2 = markers[1].getPosition();
        distance = getDistance(marker1, marker2);
        document.getElementById('distance').innerHTML =
            'Расстояние: ' + roundNumber(distance / 1000, 3) + ' километров';
    }
}

function placeMarkerAndPanTo(latLng, map) {
    marker = new google.maps.Marker({
        position: latLng,
        map: map,
    });
    map.panTo(latLng);
    return marker;
}

function geocode(latLngArray) {
    // getting human readable adress based on lattitute and longtittude

    requestURL =
        'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
        latLngArray[0] +
        ',' +
        latLngArray[1] +
        '&key=AIzaSyBqQWVdLdaFiMVjeVJY9nCrG617KMJoPa0&language=ru';
    apiResponse = JSON.parse(httpGet(requestURL));
    return apiResponse.results[0].formatted_address;
}

var rad = function (x) {
    return (x * Math.PI) / 180;
};

function getDistance(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) *
            Math.cos(rad(p2.lat())) *
            Math.sin(dLong / 2) *
            Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
}

var mkad_points = [
    [37.842663, 55.774543],
    [37.842663, 55.774543],
    [37.84269, 55.765129],
    [37.84216, 55.75589],
    [37.842232, 55.747672],
    [37.841109, 55.739098],
    [37.840112, 55.730517],
    [37.839555, 55.721782],
    [37.836968, 55.712173],
    [37.832449, 55.702566],
    [37.829557, 55.694271],
    [37.831425, 55.685214],
    [37.834695, 55.676732],
    [37.837543, 55.66763],
    [37.839295, 55.658535],
    [37.834713, 55.650881],
    [37.824948, 55.643749],
    [37.813746, 55.636433],
    [37.803083, 55.629521],
    [37.793022, 55.623666],
    [37.781614, 55.617657],
    [37.769945, 55.61114],
    [37.758428, 55.604819],
    [37.747199, 55.599077],
    [37.736949, 55.594763],
    [37.721013, 55.588135],
    [37.709416, 55.58407],
    [37.695708, 55.578971],
    [37.682709, 55.574157],
    [37.668471, 55.57209],
    [37.649948, 55.572767],
    [37.63252, 55.573749],
    [37.619243, 55.574579],
    [37.600828, 55.575648],
    [37.586814, 55.577785],
    [37.571866, 55.581383],
    [37.55761, 55.584782],
    [37.534541, 55.590027],
    [37.527732, 55.59166],
    [37.512227, 55.596173],
    [37.501959, 55.602902],
    [37.493874, 55.609685],
    [37.485682, 55.616259],
    [37.477812, 55.623066],
    [37.466709, 55.63252],
    [37.459074, 55.639568],
    [37.450135, 55.646802],
    [37.441691, 55.65434],
    [37.433292, 55.66177],
    [37.425513, 55.671509],
    [37.418497, 55.680179],
    [37.414338, 55.687995],
    [37.408076, 55.695418],
    [37.397934, 55.70247],
    [37.388978, 55.709784],
    [37.38322, 55.718354],
    [37.379681, 55.725427],
    [37.37483, 55.734978],
    [37.370131, 55.745291],
    [37.369368, 55.754978],
    [37.369062, 55.763022],
    [37.369691, 55.771408],
    [37.370086, 55.782309],
    [37.372979, 55.789537],
    [37.37862, 55.796031],
    [37.387047, 55.806252],
    [37.390523, 55.81471],
    [37.393371, 55.824147],
    [37.395176, 55.832257],
    [37.394476, 55.840831],
    [37.392949, 55.850767],
    [37.397368, 55.858756],
    [37.404564, 55.866238],
    [37.417446, 55.872996],
    [37.429672, 55.876839],
    [37.443129, 55.88101],
    [37.45955, 55.882904],
    [37.474237, 55.88513],
    [37.489634, 55.889361],
    [37.503001, 55.894737],
    [37.519072, 55.901823],
    [37.529367, 55.905654],
    [37.543749, 55.907682],
    [37.559757, 55.909418],
    [37.575423, 55.910881],
    [37.590488, 55.90913],
    [37.607035, 55.904902],
    [37.621911, 55.901152],
    [37.633014, 55.898735],
    [37.652993, 55.896458],
    [37.664905, 55.895661],
    [37.681443, 55.895106],
    [37.697513, 55.894046],
    [37.711276, 55.889997],
    [37.723681, 55.883636],
    [37.736168, 55.877359],
    [37.74437, 55.872743],
    [37.75718, 55.866137],
    [37.773646, 55.8577],
    [37.780284, 55.854234],
    [37.792322, 55.848038],
    [37.807961, 55.840007],
    [37.816127, 55.835816],
    [37.829665, 55.828718],
    [37.836914, 55.821325],
    [37.83942, 55.811538],
    [37.840166, 55.802472],
    [37.841145, 55.793925],
];

function inPoly(latLngCords) {
    let y = latLngCords.lat;
    let x = latLngCords.lng;
    var j = mkad_points.length - 1,
        c = false; // true/false - inside or outside of the polygon
    for (i = 0; i < mkad_points.length; i++) {
        if (
            ((mkad_points[i][1] <= y && y < mkad_points[j][1]) ||
                (mkad_points[j][1] <= y && y < mkad_points[i][1])) &&
            x >
                ((mkad_points[j][0] - mkad_points[i][0]) *
                    (y - mkad_points[i][1])) /
                    (mkad_points[j][1] - mkad_points[i][1]) +
                    mkad_points[i][0]
        ) {
            c = !c;
        }
        j = i;
    }
    return c;
}

function getDistanceArray(p1, p2) {
    // p1[0] - p1.lat, p1[1] - p1.lng
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2[0] - p1[0]);
    var dLong = rad(p2[1] - p1[1]);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1[0])) *
            Math.cos(rad(p2[0])) *
            Math.sin(dLong / 2) *
            Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
}

function getmyMKADdistance(latLngCords) {
    let closestDistace = 99999999999999999999999;
    let closestLatLng = [];

    for (var j = 0; j < mkad_points.length; j++) {
        let currentDistance = getDistanceArray(
            [latLngCords.lat, latLngCords.lng],
            [mkad_points[j][1], mkad_points[j][0]]
        );
        if (currentDistance < closestDistace) {
            closestDistace = currentDistance;
            closestLatLng = mkad_points[j];
        }
    }
    console.log(closestLatLng);
    return closestDistace;
}

// ------------------------------------- /map -------------------------------------------------------