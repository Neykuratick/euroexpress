// ------------------------------------- global -------------------------------------------------------

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
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
    const [sv, ev] = num.toString().split("e");
    return Number(
        Number(Math.round(parseFloat(sv + "e" + dec)) + "e-" + dec) +
            "e" +
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
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 55.754652859190074, lng: 37.62576896153753 },
        zoom: 10,
        gestureHandling: "greedy",
        streetViewControl: false,
        mapTypeControl: false,
    });

    // map.addListener("click", (e) => {
    //     clear();
    //     markers.push(placeMarkerAndPanTo(e.latLng, map));
    //     getAdressAndDistance();
    // });
}

// ----------------------------- search box ---------------------------------------

function initAutocomplete() {
    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);

    var input2 = document.getElementById("pac-inputTwo");
    const searchBox2 = new google.maps.places.SearchBox(input2);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
        searchBox2.setBounds(map.getBounds());
    });
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.

    searchBox.addListener("places_changed", () => {
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
                console.log("Returned place contains no geometry");
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

    searchBox2.addListener("places_changed", () => {
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
                console.log("Returned place contains no geometry");
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
        adress1 = "";
        adress2 = "";
        distance = 0;
        // document.getElementById('point2').innerHTML = ''; // адрес второй точки
        // document.getElementById('secondData').innerHTML = ''; // Ваша вторая точка:
        document.getElementById("distance").innerHTML = ""; // Расстояние
        document.getElementById("pac-input").value = "";
        document.getElementById("pac-inputTwo").value = "";
    }
}

var adress1 = "";
var adress2 = "";
function getAdressAndDistance() {
    // does all the work.
    // gets coordinates of 2 markers
    // and counting distance

    if (markers.length < 2) {
        var marPos = markers[0].getPosition().toJSON();
        markersPosition.push(jsonToArray(marPos));

        adress1 = geocode(markersPosition[0]);
        document.getElementById("pac-input").value = adress1;
    }

    if (markers.length == 2) {
        var marPos = markers[1].getPosition().toJSON();
        markersPosition.push(jsonToArray(marPos));

        adress2 = geocode(markersPosition[1]);
        document.getElementById("pac-inputTwo").value = adress2;

        marker1 = markers[0].getPosition();
        marker2 = markers[1].getPosition();
        distance = getDistance(marker1, marker2);
        document.getElementById("distance").innerHTML =
            "Расстояние: " + roundNumber(distance / 1000, 3) + " километров";
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
        "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
        latLngArray[0] +
        "," +
        latLngArray[1] +
        "&key=AIzaSyBqQWVdLdaFiMVjeVJY9nCrG617KMJoPa0&language=ru";
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

// ------------------------------------- second section -------------------------------------------------------

function cargoInput() {
    cargoWeightLabel = document.getElementById("cargoWeightLabel");
    cargoWeightLabel.innerHTML = "Вес груза (кг)";
}

function cargoVolumeInput() {
    cargoVolumeLabel = document.getElementById("cargoVolumeLabel");
    cargoVolumeLabel.innerHTML = "Объём груза (м²)";
}

// ------------------------------------- /second section -------------------------------------------------------

// ------------------------------------- third section -------------------------------------------------------

function limitOptions() {
    let vechicle_select = document.getElementById("vechicle_select");
    let cargo_select = document.getElementById("cargo_select");

    cargo_select.remove(0);
    cargo_select.remove(0);
    cargo_select.remove(0);
    cargo_select.remove(0);
    cargo_select.remove(0);
    cargo_select.remove(0);

    if (vechicle_select.selectedIndex != 0) {
        cargo_select.remove(1);
    }

    let option1 = document.createElement("option");
    let option2 = document.createElement("option");
    let option3 = document.createElement("option");
    let option4 = document.createElement("option");
    let option5 = document.createElement("option");

    if (vechicle_select.selectedIndex == 1) {
        // if Тент, изотерм, целмет.
        option1.text = "1,5т / 6-16м3, 4м";
        option1.value = 5000;
        option2.text = "3т / 14-21м3";
        option2.value = 6000;
        option3.text = "5 т / 18-35м3";
        option3.value = 8000;
        option4.text = "10тн / 40-50м3";
        option4.value = 10000;
        option5.text = "20т / 82/96м3";
        option5.value = 12000;

        cargo_select.add(option1);
        cargo_select.add(option2);
        cargo_select.add(option3);
        cargo_select.add(option4);
        cargo_select.add(option5);
    }

    if (vechicle_select.selectedIndex == 2) {
        // if Рефрижератор
        option1.text = "1-1,5 т /6-12м3";
        option1.value = 6000;
        option2.text = "3т / 14-21м3";
        option2.value = 7000;
        option3.text = "5 т / 18-25м3";
        option3.value = 9000;
        option4.text = "10т / 35м3";
        option4.value = 11000;
        option5.text = "20т / 82м3";
        option5.value = 13000;

        cargo_select.add(option1);
        cargo_select.add(option2);
        cargo_select.add(option3);
        cargo_select.add(option4);
        cargo_select.add(option5);
    }

    if (vechicle_select.selectedIndex == 3) {
        // if Борт
        option1.text = "1,5 т. 3м";
        option1.value = 6000;
        option2.text = "3т. 4м";
        option2.value = 7000;
        option3.text = "5 т. 6м";
        option3.value = 9000;
        option4.text = "10т. 6м-7м";
        option4.value = 11000;
        option5.text = "20т. 12м-13.5м";
        option5.value = 13000;

        cargo_select.add(option1);
        cargo_select.add(option2);
        cargo_select.add(option3);
        cargo_select.add(option4);
        cargo_select.add(option5);
    }

    if (vechicle_select.selectedIndex == 4) {
        // if Тент разборный, борт
        option1.text = "1,5 т. 3м";
        option1.value = 6000;
        option2.text = "3т. 4м";
        option2.value = 7000;
        option3.text = "5 т. 6м";
        option3.value = 9000;
        option4.text = "10т. 6м-7м";
        option4.value = 11000;
        option5.text = "20т. 12м-13.5м";
        option5.value = 13000;

        cargo_select.add(option1);
        cargo_select.add(option2);
        cargo_select.add(option3);
        cargo_select.add(option4);
        cargo_select.add(option5);
    }

    if (vechicle_select.selectedIndex == 5) {
        // if Манипулятор
        option1.text = "5т. 5-6м";
        option1.value = 10000;
        option2.text = "10т. 6-7,20м";
        option2.value = 14000;

        cargo_select.add(option1);
        cargo_select.add(option2);
    }
}

// ------------------------------------- /third section -------------------------------------------------------

// ------------------------------------- newThird section -------------------------------------------------------

function checkCheckbox(id) {
    input_checkbox_checkmark = document.getElementById(id);

    if (input_checkbox_checkmark.checked) {
        input_checkbox_checkmark.parentElement.classList.toggle("input_checkbox_checked")

        document.getElementById(id).checked = false;
        classToApply = 'input_checkbox_UNchecked'
    } else {
        input_checkbox_checkmark.parentElement.classList.toggle("input_checkbox_checked")
        
        document.getElementById(id).checked = true;
        classToApply = 'input_checkbox_checked'
    }
}
// ------------------------------------- /newThird section -------------------------------------------------------

// ------------------------------------- fourth section -------------------------------------------------------

var element = document.getElementById("phone");
var maskOptions = {
    mask: "{+7} (000) 000 00-00",
};
var mask = IMask(element, maskOptions);

function countCost() {
    // -- base variables to count cost --
    let mkad_distance = 0;
    let mkad_distance_km = 0;
    let mkad_rate = 30;
    let min_rate = 4000;
    let points_cost = 500;
    // -- /base variables to count cost --

    // -- checking if there's one or two markers on the map --
    if (markers.length == 1) {
        // if there's only one

        JSON_marker_one = markers[0].getPosition().toJSON(); // getting coordinates of the marker
        mkad_distance = getmyMKADdistance(JSON_marker_one); // measuring distance
        mkad_distance = roundNumber(mkad_distance, 0); // rounding distance
        mkad_distance_km = mkad_distance / 1000; // converting into kilometers
    }

    if (markers.length == 2) {
        // if there are 2 markers

        JSON_marker_one = markers[0].getPosition().toJSON(); // getting coordinates of the first marker
        JSON_marker_two = markers[1].getPosition().toJSON(); // getting coordinates of the second marker

        mkad_distance_one = getmyMKADdistance(JSON_marker_one);
        mkad_distance_two = getmyMKADdistance(JSON_marker_two);
        mkad_distance = mkad_distance_one + mkad_distance_two;

        mkad_distance = roundNumber(mkad_distance, 0); // rounding disrance in meters
        mkad_distance_km = mkad_distance / 1000; // converting into kilometers
    }
    // -- /checking if there's one or two markers on the map --

    // -- getting vehicle_select and cargo_select input --
    let vechicle_select = document.getElementById("vechicle_select").value;
    let cargo_select = document.getElementById("cargo_select").value;
    min_rate = cargo_select;

    vechicle_type = 0;
    switch (vechicle_select) {
        // counting min mkad_rate based on vehivle type

        case "Тент, изотерм, целмет.":
            vechicle_type = 1;
            break;
        case "Рефрижератор":
            vechicle_type = 2;
            break;
        case "Борт":
            vechicle_type = 3;
            break;
        case "Тент разборный, борт":
            vechicle_type = 4;
            break;
        case "Манипулятор":
            vechicle_type = 5;
            break;
    }

    switch (true) {
        // Тент, изотерм, целмет.
        case vechicle_type == 1 && cargo_select == 5000:
            points_cost = 500;
            mkad_rate = 30;
            break;
        case vechicle_type == 1 && cargo_select == 6000:
            points_cost = 500;
            mkad_rate = 40;
            break;
        case vechicle_type == 1 && cargo_select == 8000:
            points_cost = 1000;
            mkad_rate = 50;
            break;
        case vechicle_type == 1 && cargo_select == 10000:
            points_cost = 1000;
            mkad_rate = 50;
            break;
        case vechicle_type == 1 && cargo_select == 12000:
            points_cost = 1500;
            mkad_rate = 60;
            break;

        // Рефрижератор
        case vechicle_type == 2 && cargo_select == 6000:
            points_cost = 1000;
            mkad_rate = 40;
            break;
        case vechicle_type == 2 && cargo_select == 7000:
            points_cost = 1000;
            mkad_rate = 50;
            break;
        case vechicle_type == 2 && cargo_select == 9000:
            points_cost = 1500;
            mkad_rate = 60;
            break;
        case vechicle_type == 2 && cargo_select == 11000:
            points_cost = 1500;
            mkad_rate = 60;
            break;
        case vechicle_type == 2 && cargo_select == 13000:
            points_cost = 2000;
            mkad_rate = 70;
            break;

        // Борт
        case vechicle_type == 3 && cargo_select == 6000:
            points_cost = 500;
            mkad_rate = 30;
            break;
        case vechicle_type == 3 && cargo_select == 7000:
            points_cost = 500;
            mkad_rate = 40;
            break;

        // Тент разборный, борт
        case vechicle_type == 4 && cargo_select == 9000:
            points_cost = 1000;
            mkad_rate = 50;
            break;
        case vechicle_type == 4 && cargo_select == 11000:
            points_cost = 1000;
            mkad_rate = 50;
            break;
        case vechicle_type == 4 && cargo_select == 13000:
            points_cost = 1500;
            mkad_rate = 60;
            break;

        // Манипулятор
        case vechicle_type == 5 && cargo_select == 10000:
            points_cost = 1500;
            mkad_rate = 60;
            break;
        case vechicle_type == 5 && cargo_select == 14000:
            points_cost = 2000;
            mkad_rate = 90;
            break;
    }
    // -- /getting vehicle_select and cargo_select input --

    // -- getting input from newThirdSection --
    if (document.getElementById("to_Sadovoe").checked) {
        Sadovoe_points = 1;
    } else {
        Sadovoe_points = 0;
    }

    if (document.getElementById("to_TTK").checked) {
        TTK_points = 1;
    } else {
        TTK_points = 0;
    }

    AltLoad_points_undef = Number.parseInt(
        document.getElementById("AltLoad_points").value
    );
    if (Number.isNaN(AltLoad_points_undef) == false) {
        AltLoad_points = AltLoad_points_undef;
    } else {
        AltLoad_points = 0;
    }

    AltLoad_points += Sadovoe_points;
    AltLoad_points += TTK_points;

    AltLoad_points_cost = AltLoad_points * points_cost;
    // -- /getting input from newThirdSection --

    // -- counting total cost --
    min_rate = Number.parseInt(min_rate);
    mkad_cost = mkad_distance_km * mkad_rate;
    console.log(mkad_distance_km, mkad_rate);
    totalcost = min_rate + mkad_cost + AltLoad_points_cost;
    totalcost = roundNumber(totalcost, 0);

    console.log(
        "min_rate",
        min_rate,
        "mkad_distance_km",
        mkad_distance_km,
        "mkad_cost",
        mkad_cost,
        "AltLoad_points_cost",
        AltLoad_points_cost
    );
    // -- /countring total cost --

    document.getElementById("countCost").innerHTML = "Пересчитать стоимость";
    document.getElementById("costLabel").innerHTML =
        "Итоговая примерная стоимость: " + totalcost + " руб."; // displaying total cost
}

var final_message = "";
function submitData() {
    let nameData = document.getElementById("name").value;
    let cargoName = document.getElementById("cargoName").value;
    let cargoWeight = document.getElementById("cargoWeight").value;
    let cargoVolume = document.getElementById("cargoVolume").value;
    let vechicle_select = document.getElementById("vechicle_select").value;
    let loadDate = document.getElementById("load").value;
    let unloadDate = document.getElementById("unload").value;
    let phone = document.getElementById("phone").value;
    let comment = document.getElementById("comment").value;
    let price = totalcost;

    if (document.getElementById("to_Sadovoe").checked) {
        Sadovoe_points = "Да";
    } else {
        Sadovoe_points = "Нет";
    }

    if (document.getElementById("to_TTK").checked) {
        TTK_points = "Да";
    } else {
        TTK_points = "Нет";
    }

    AltLoad_points_undef = Number.parseInt(
        document.getElementById("AltLoad_points").value
    );
    if (Number.isNaN(AltLoad_points_undef) == false) {
        AltLoad_points = AltLoad_points_undef;
    } else {
        AltLoad_points = 0;
    }

    final_message = `
  Контактное лицо: ${nameData}<br>
  Номер телефона: ${phone}<br>
  <br>
  Адрес куда: ${adress1}<br>
  Адрес откуда: ${adress2}<br>
  <br>
  Въезд в ТТК: ${Sadovoe_points}<br>
  Выезд в Садовое кольцо: ${TTK_points}<br>
  Доп. точки выгрузки ${AltLoad_points}<br>
  <br>
  Наименование груза: ${cargoName}<br>
  Вес груза: ${cargoWeight}<br>
  Объём груза: ${cargoVolume}<br>
  Тип транспорта: ${vechicle_select}<br>
  Дата погрузки: ${loadDate}<br>
  Дата выгрузки: ${unloadDate}<br>
  Итоговая цена: ${price} руб.<br>
  <br>
  Комментарий к заказу: ${comment}<br>
  `;
    Email.send({
        Host: "smtp.euroexpress.msk.ru",
        Username: "noreply@euroexpress.msk.ru",
        Password: "D8r8M9y6",
        To: "euroexpress_logist@bk.ru",
        From: "noreply@euroexpress.msk.ru",
        Subject: "EuroExpress - Новый отклик!",
        Body: final_message,
    }).then((message) => checkSended(message), console.log(final_message));
}

 var final_button_Pressed = false;
 function final_button() {

    if (final_button_Pressed === false) {
        countCost()
        document.getElementById("submit").innerHTML = "Отправить"
        final_button_Pressed = true;
    } else {
        submitData()
        final_button_Pressed = false;
    }
 }

// ------------------------------------- /fourth section  -------------------------------------------------------

function checkSended(message) {
    if (message == "OK") {
        localStorage.setItem("final_message", final_message);
        window.open("/new_order/", "_parent");
    } else {
        alert(
            "Что-то пощло не так! Обратитесь в техническую поддержку. Ошибка:",
            message
        );
    }
}
