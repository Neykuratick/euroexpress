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
        // console.log(inPoly(markersPosition[0], moscow_region_points, false))
        // console.log(inPoly(markersPosition[1], moscow_region_points, false))
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

var moscow_region_points = [
[37.0170593, 55.2798975],
[37.0170593, 55.2798975],
[36.9909668, 55.2728572],
[36.9593811, 55.2634683],
[36.9456482, 55.2525117],
[36.9360352, 55.2423350],
[36.9154358, 55.2360711],
[36.8811035, 55.2329388],
[36.8618774, 55.2290231],
[36.8550110, 55.2164901],
[36.8399048, 55.2055206],
[36.8069458, 55.1945480],
[36.7945862, 55.2070878],
[36.8014526, 55.2258902],
[36.7890930, 55.2415520],
[36.7712402, 55.2556424],
[36.7465210, 55.2673806],
[36.7245483, 55.2611207],
[36.6847229, 55.2634683],
[36.6654968, 55.2673806],
[36.6421509, 55.2720749],
[36.6160583, 55.2665982],
[36.6064453, 55.2814618],
[36.6050720, 55.2971018],
[36.6146851, 55.3072644],
[36.6105652, 55.3252382],
[36.6119385, 55.3408609],
[36.5927124, 55.3471082],
[36.5679932, 55.3268007],
[36.5446472, 55.3228942],
[36.5322876, 55.3135171],
[36.5240479, 55.3041377],
[36.4979553, 55.2986654],
[36.4746094, 55.3033560],
[36.4581299, 55.2963199],
[36.4430237, 55.2924104],
[36.4155579, 55.2955381],
[36.4128113, 55.3049194],
[36.3880920, 55.2963199],
[36.3853455, 55.2877185],
[36.3729858, 55.2791153],
[36.3702393, 55.2752041],
[36.3702393, 55.2642507],
[36.3716125, 55.2587729],
[36.3482666, 55.2517289],
[36.3427734, 55.2517289],
[36.3290405, 55.2376372],
[36.3317871, 55.2251069],
[36.3249207, 55.2102222],
[36.3084412, 55.2047369],
[36.2905884, 55.1890606],
[36.3029480, 55.1843565],
[36.2837219, 55.1772993],
[36.2603760, 55.1725938],
[36.2493896, 55.1843565],
[36.2205505, 55.1851405],
[36.1999512, 55.1882766],
[36.1766052, 55.1921964],
[36.1436462, 55.1851405],
[36.1381531, 55.1780835],
[36.1161804, 55.1835724],
[36.1106873, 55.1953319],
[36.1010742, 55.2063042],
[36.0777283, 55.2110057],
[36.0420227, 55.2180570],
[36.0269165, 55.2258902],
[36.0118103, 55.2149232],
[35.9857178, 55.2219738],
[35.9747314, 55.2298062],
[35.9623718, 55.2360711],
[35.9445190, 55.2399861],
[35.9321594, 55.2345050],
[35.9129333, 55.2384202],
[35.8923340, 55.2407691],
[35.8786011, 55.2415520],
[35.8593750, 55.2360711],
[35.8360291, 55.2352880],
[35.8181763, 55.2446837],
[35.8140564, 55.2548598],
[35.8209229, 55.2650332],
[35.8030701, 55.2603381],
[35.7893372, 55.2619032],
[35.7769775, 55.2705102],
[35.7728577, 55.2759864],
[35.7604980, 55.2845903],
[35.7467651, 55.2908465],
[35.7330322, 55.2931924],
[35.7206726, 55.2830261],
[35.7000732, 55.2861544],
[35.6753540, 55.2814618],
[35.6520081, 55.2806797],
[35.6259155, 55.2838082],
[35.6149292, 55.2885006],
[35.6039429, 55.2939743],
[35.5805969, 55.2924104],
[35.5723572, 55.2892826],
[35.5627441, 55.2791153],
[35.5692673, 55.2710970],
[35.5754471, 55.2671850],
[35.5754471, 55.2632726],
[35.5702972, 55.2583816],
[35.5665207, 55.2546641],
[35.5603409, 55.2507505],
[35.5521011, 55.2513376],
[35.5421448, 55.2548598],
[35.5311584, 55.2566207],
[35.5201721, 55.2562294],
[35.5054092, 55.2536857],
[35.4981995, 55.2505548],
[35.5033493, 55.2446837],
[35.5095291, 55.2405734],
[35.5006027, 55.2390074],
[35.4875565, 55.2384202],
[35.4741669, 55.2362669],
[35.4556274, 55.2348965],
[35.4456711, 55.2298062],
[35.4357147, 55.2303936],
[35.4199219, 55.2307852],
[35.4103088, 55.2347007],
[35.4030991, 55.2376372],
[35.3897095, 55.2354838],
[35.3814697, 55.2397904],
[35.3715134, 55.2427264],
[35.3567505, 55.2427264],
[35.3594971, 55.2476193],
[35.3567505, 55.2556424],
[35.3570938, 55.2605337],
[35.3512573, 55.2660113],
[35.3485107, 55.2691410],
[35.3378677, 55.2707058],
[35.3334045, 55.2718793],
[35.3251648, 55.2814618],
[35.3031921, 55.2892826],
[35.2949524, 55.3010108],
[35.2880859, 55.3119540],
[35.2647400, 55.3189874],
[35.2551270, 55.3283632],
[35.2716064, 55.3346125],
[35.2784729, 55.3455465],
[35.2894592, 55.3572581],
[35.2894592, 55.3845717],
[35.2976990, 55.3939320],
[35.3045654, 55.4103072],
[35.3182983, 55.4243377],
[35.3086853, 55.4375842],
[35.3031921, 55.4539413],
[35.2935791, 55.4648423],
[35.3059387, 55.4749620],
[35.3196716, 55.4819664],
[35.3155518, 55.5053054],
[35.3292847, 55.5270759],
[35.3100586, 55.5410650],
[35.2908325, 55.5566025],
[35.3018188, 55.5752394],
[35.3347778, 55.5752394],
[35.3622437, 55.5752394],
[35.3869629, 55.5954194],
[35.3842163, 55.6155890],
[35.3485107, 55.6465990],
[35.3320313, 55.6605455],
[35.3155518, 55.6868753],
[35.3182983, 55.7069978],
[35.3100586, 55.7286568],
[35.3265381, 55.7518494],
[35.3265381, 55.7827515],
[35.2853394, 55.7997372],
[35.2688599, 55.8336864],
[35.2331543, 55.8691471],
[35.2139282, 55.8984163],
[35.2029419, 55.9122729],
[35.1589966, 55.9491998],
[35.1507568, 55.9599635],
[35.1672363, 55.9860915],
[35.1947021, 56.0106665],
[35.2304077, 56.0321567],
[35.2770996, 56.0521013],
[35.3155518, 56.0735684],
[35.3237915, 56.0965558],
[35.2908325, 56.1179982],
[35.3155518, 56.1394287],
[35.3512573, 56.1639061],
[35.3540039, 56.1822539],
[35.3375244, 56.2005929],
[35.3128052, 56.2189232],
[35.3540039, 56.2296118],
[35.4006958, 56.2387711],
[35.4336548, 56.2418237],
[35.4693604, 56.2464022],
[35.4995728, 56.2586087],
[35.4858398, 56.2799608],
[35.4776001, 56.2997771],
[35.4721069, 56.3195831],
[35.4803467, 56.3409012],
[35.5023193, 56.3652501],
[35.5078125, 56.3804603],
[35.4528809, 56.3819810],
[35.4144287, 56.3880631],
[35.4254150, 56.4063037],
[35.4556274, 56.4306109],
[35.4309082, 56.4503490],
[35.4858398, 56.4549025],
[35.5050659, 56.4336482],
[35.5297852, 56.4533848],
[35.5737305, 56.4670425],
[35.6204224, 56.4761450],
[35.6643677, 56.4488311],
[35.7055664, 56.4139014],
[35.7467651, 56.3971845],
[35.7797241, 56.4017444],
[35.8731079, 56.3895835],
[35.8868408, 56.3728560],
[36.0296631, 56.3728560],
[36.0571289, 56.3500339],
[36.0900879, 56.3424235],
[36.1038208, 56.3743770],
[36.1257935, 56.3880631],
[36.2329102, 56.4169400],
[36.2631226, 56.4260545],
[36.3372803, 56.4473131],
[36.3784790, 56.4564202],
[36.4581299, 56.4670425],
[36.5542603, 56.4776618],
[36.6311646, 56.5019234],
[36.6943359, 56.4943433],
[36.6943359, 56.5337432],
[36.7684937, 56.5609960],
[36.8179321, 56.5821791],
[36.8865967, 56.5821791],
[36.9717407, 56.5549415],
[37.0211792, 56.5261695],
[37.0761108, 56.5276843],
[37.1337891, 56.5579689],
[37.1557617, 56.6078855],
[37.1228027, 56.6396162],
[37.1640015, 56.6833911],
[37.1502686, 56.7045056],
[37.0925903, 56.7406744],
[37.1200562, 56.7677781],
[37.1392822, 56.7828273],
[37.2491455, 56.7662728],
[37.2903442, 56.7466991],
[37.3425293, 56.7707884],
[37.4249268, 56.7873408],
[37.4880981, 56.7873408],
[37.5292969, 56.8264358],
[37.5375366, 56.8564810],
[37.5430298, 56.8850017],
[37.5457764, 56.9090023],
[37.6309204, 56.9344860],
[37.6940918, 56.9464723],
[37.7655029, 56.9419778],
[37.7847290, 56.9120013],
[37.8451538, 56.9015038],
[37.9000854, 56.8789992],
[37.9522705, 56.8880026],
[37.9769897, 56.8594842],
[37.9989624, 56.8159142],
[37.9989624, 56.7768083],
[38.0511475, 56.7557344],
[38.0978394, 56.7557344],
[38.1857300, 56.7617567],
[38.2461548, 56.7587457],
[38.2598877, 56.7798179],
[38.2791138, 56.7421806],
[38.3203125, 56.6969661],
[38.3120728, 56.6471673],
[38.3477783, 56.6139315],
[38.3532715, 56.5746151],
[38.3203125, 56.5504000],
[38.2818604, 56.5231396],
[38.3148193, 56.5049550],
[38.3367920, 56.5049550],
[38.3203125, 56.4806954],
[38.3642578, 56.4655252],
[38.3917236, 56.4518669],
[38.3999634, 56.4260545],
[38.3999634, 56.4017444],
[38.4356689, 56.3880631],
[38.4109497, 56.3500339],
[38.4329224, 56.3134901],
[38.4246826, 56.2753864],
[38.4040833, 56.2563203],
[38.4274292, 56.2296118],
[38.4521484, 56.2105229],
[38.4713745, 56.2005929],
[38.4919739, 56.2112866],
[38.5235596, 56.2135778],
[38.5098267, 56.1944809],
[38.5112000, 56.1761389],
[38.5194397, 56.1631414],
[38.5166931, 56.1202949],
[38.5331726, 56.1003856],
[38.5386658, 56.0728020],
[38.5633850, 56.0544019],
[38.5894775, 56.0444315],
[38.6073303, 56.0145049],
[38.5826111, 55.9983810],
[38.5990906, 55.9822503],
[38.6238098, 55.9784087],
[38.6814880, 55.9822503],
[38.7213135, 55.9707243],
[38.7831116, 55.9384331],
[38.8421631, 55.9153515],
[38.8888550, 55.9453549],
[38.9341736, 55.9384331],
[38.9959717, 55.9384331],
[39.0206909, 55.9491998],
[39.0447235, 55.9422787],
[39.0138245, 55.9357410],
[39.0213776, 55.9268940],
[39.0385437, 55.9234316],
[39.0481567, 55.9195842],
[39.0522766, 55.8988012],
[39.0694427, 55.8780072],
[39.0598297, 55.8629823],
[39.0824890, 55.8568166],
[39.1051483, 55.8502644],
[39.1209412, 55.8448677],
[39.1587067, 55.8537334],
[39.1827393, 55.8379279],
[39.2555237, 55.8410124],
[39.2898560, 55.8498790],
[39.3365479, 55.8564312],
[39.3077087, 55.8321439],
[39.3180084, 55.7966494],
[39.3296814, 55.7696211],
[39.4010925, 55.7862264],
[39.4402313, 55.7750283],
[39.4773102, 55.7495307],
[39.5343018, 55.7503036],
[39.5700073, 55.7827515],
[39.6826172, 55.7858403],
[39.7238159, 55.7889290],
[39.7952271, 55.8429401],
[39.8721313, 55.8244304],
[39.9050903, 55.7595772],
[39.9572754, 55.7224697],
[40.0726318, 55.6729382],
[40.0616455, 55.5876591],
[40.0588989, 55.5317395],
[40.1715088, 55.5099715],
[40.2182007, 55.4757403],
[40.1522827, 55.4336886],
[40.1824951, 55.3900321],
[40.2182007, 55.3369558],
[40.1852417, 55.2885006],
[40.1220703, 55.2462494],
[40.0396729, 55.2180570],
[39.9435425, 55.2008184],
[39.8391724, 55.1898446],
[39.7595215, 55.1584740],
[39.7485352, 55.1255083],
[39.8309326, 55.1082297],
[39.8364258, 55.0437618],
[39.8034668, 55.0059762],
[39.7183228, 55.0122763],
[39.6112061, 55.0170007],
[39.5452881, 54.9760374],
[39.4985962, 54.9413435],
[39.4628906, 54.8987236],
[39.4464111, 54.8671242],
[39.3695068, 54.8070171],
[39.3695068, 54.7436498],
[39.3173218, 54.7277924],
[39.2678833, 54.7309644],
[39.2541504, 54.6706545],
[39.2211914, 54.6261583],
[39.1085815, 54.6293382],
[39.0426636, 54.6245682],
[38.9382935, 54.5959367],
[38.8998413, 54.6277483],
[38.8531494, 54.5863883],
[38.8256836, 54.5433932],
[38.7982178, 54.5019475],
[38.8009644, 54.4652490],
[38.8641357, 54.4428946],
[38.9410400, 54.4253219],
[38.8998413, 54.3885546],
[38.8723755, 54.3669528],
[38.8449097, 54.3453509],
[38.8421631, 54.3789577],
[38.7762451, 54.3613576],
[38.7240601, 54.3373453],
[38.7103271, 54.2988964],
[38.7048340, 54.2427606],
[38.6636353, 54.2299188],
[38.5784912, 54.2812619],
[38.5235596, 54.2956907],
[38.5208130, 54.3629579],
[38.5015869, 54.4045445],
[38.4356689, 54.4093402],
[38.4054565, 54.4492828],
[38.3834839, 54.4875911],
[38.3944702, 54.5210815],
[38.4246826, 54.5481726],
[38.4741211, 54.5688773],
[38.5015869, 54.5943454],
[38.4988403, 54.6134361],
[38.4823608, 54.6356973],
[38.4027100, 54.6452341],
[38.3587646, 54.6484125],
[38.2846069, 54.6547686],
[38.2489014, 54.6627123],
[38.1967163, 54.6928844],
[38.0703735, 54.7055817],
[38.0209351, 54.7484058],
[38.0099487, 54.7880173],
[37.9742432, 54.8244258],
[37.9220581, 54.8418269],
[37.7764893, 54.8370819],
[37.7325439, 54.8307543],
[37.7627563, 54.7499910],
[37.7133179, 54.7151021],
[37.6446533, 54.7214477],
[37.5595093, 54.7388932],
[37.5485229, 54.7626704],
[37.5347900, 54.7927681],
[37.4551392, 54.8323363],
[37.3919678, 54.8402453],
[37.3315430, 54.8402453],
[37.2573853, 54.8339182],
[37.2106934, 54.8449899],
[37.1667480, 54.8623822],
[37.1694946, 54.8813470],
[37.1667480, 54.9318763],
[37.1365356, 55.0059762],
[37.0678711, 55.0626412],
[37.0816040, 55.0988019],
[37.0458984, 55.1443492],
[37.1090698, 55.1600431],
[37.1612549, 55.1804360],
[37.1612549, 55.2227571],
[37.2106934, 55.2509462],
[37.3178101, 55.2556424],
[37.3617554, 55.2305894],
[37.4276733, 55.2634683],
[37.4331665, 55.2978836],
[37.4496460, 55.3447656],
[37.4496460, 55.3853518],
[37.4331665, 55.4087480],
[37.4194336, 55.4290135],
[37.4304199, 55.4477108],
[37.5238037, 55.4336886],
[37.5622559, 55.4695133],
[37.5759888, 55.5146371],
[37.5952148, 55.5612625],
[37.5842285, 55.5798972],
[37.5210571, 55.6124867],
[37.4633789, 55.6357483],
[37.4283600, 55.6659678],
[37.4029541, 55.6617074],
[37.3507690, 55.6500861],
[37.3075104, 55.6450491],
[37.2587585, 55.6423366],
[37.2182465, 55.6186911],
[37.2148132, 55.6031782],
[37.1990204, 55.6039540],
[37.1743011, 55.5977472],
[37.1516418, 55.6039540],
[37.1262360, 55.6062813],
[37.1049500, 55.6027903],
[37.1022034, 55.5899873],
[37.1118164, 55.5550490],
[37.1173096, 55.5247440],
[37.1351624, 55.5060831],
[37.1324158, 55.4757403],
[37.0994568, 55.4679563],
[37.0925903, 55.4640638],
[37.1337891, 55.4430373],
[37.0953369, 55.4391423],
[37.0637512, 55.4508262],
[37.0129395, 55.4586136],
[36.9662476, 55.4702917],
[36.9470215, 55.4990830],
[36.9154358, 55.5084162],
[36.8453979, 55.5021943],
[36.8179321, 55.4944156],
[36.7987061, 55.4531626],
[36.8234253, 55.4212203],
[36.8605042, 55.3915921],
[36.8934631, 55.3533546],
[36.9580078, 55.3244569],
[36.9895935, 55.3002290],
[36.9992065, 55.2885006],
[37.0184326, 55.2759864],
];

var leningrad_region_points = [
    [59.520589,30.079306],
    [59.561089,30.653528],
    [59.692375,30.983081],
    [59.805574,31.112905],
    [59.968407,30.833284],
    [60.110544,30.558656],
    [60.127958,30.333961],
    [60.083162,29.989428],
    [60.048279,29.679847],
    [59.818128,29.594962],
    [59.677252,29.629915],
    [59.563618,29.88457],
];

var kad_points = [
    [59.832303,30.282054],
    [59.811332,30.32417],
    [59.817125,30.394099],
    [59.825514,30.433036],
    [59.85406,30.497402],
    [59.861841,30.522433],
    [59.888966,30.531449],
    [59.941861,30.54299],
    [59.976527,30.55618],
    [59.981477,30.511664],
    [60.034225,30.445713],
    [60.048222,30.416035],
    [60.068795,30.379763],
    [60.068441,30.385064],
    [60.086903,30.376778],
    [60.092687,30.363521],
    [60.094615,30.343082],
    [60.095441,30.320433],
    [60.098195,30.293918],
    [60.098195,30.274584],
    [60.095992,30.250831],
    [60.086627,30.233154],
    [60.081944,30.193381],
    [60.075331,30.177914],
    [60.054656,30.105549],
    [60.048589,30.060252],
    [60.031224,29.893731],
    [60.018609,29.732929],
    [60.005324,29.705021],
    [59.969429,29.683758],
    [59.936824,29.670468],
    [59.90352,29.662495],
    [59.881521,29.695718],
    [59.864178,29.786086],
    [59.838147,29.816652],
    [59.816105,29.847218],
    [59.817442,29.940244],
    [59.82145,30.001376],
    [59.82145,30.001376],
    [59.815437,30.066494],
    [59.799397,30.160849]
];



function inPoly(latLngCords, polygon, reversed) {
    let y;
    let x;
    try {
        y = latLngCords[1]; // lat
        x = latLngCords[0]; // lng
      } catch (error) {
        console.error(error);
    }
    

    if (reversed) {
        y = latLngCords[0]; // lat
        x = latLngCords[1]; // lng
    } 

    var j = polygon.length - 1,
        c = false; // true/false - inside or outside of the polygon
    for (i = 0; i < polygon.length; i++) {
        if (
            ((polygon[i][1] <= y && y < polygon[j][1]) ||
                (polygon[j][1] <= y && y < polygon[i][1])) &&
            x >
                ((polygon[j][0] - polygon[i][0]) *
                    (y - polygon[i][1])) /
                    (polygon[j][1] - polygon[i][1]) +
                    polygon[i][0]
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

function getmyСlosestDistanceToPoly(latLngCords, polygon, reversed) {
    let closestDistace = 99999999999999999999999;
    let closestLatLng = [];
    let currentDistance;

    for (var j = 0; j < polygon.length; j++) {
        
        if (reversed) {
            currentDistance = getDistanceArray(
                [latLngCords.lat, latLngCords.lng],
                [polygon[j][1], polygon[j][0]]
            );
        } else {
            currentDistance = getDistanceArray(
                [latLngCords.lng, latLngCords.lat],
                [polygon[j][1], polygon[j][0]]
            );
        }
        if (currentDistance < closestDistace) {
            closestDistace = currentDistance;
            closestLatLng = polygon[j];
        }
    }
    // console.log(closestLatLng);
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
    option1.style.color = "black"
    let option2 = document.createElement("option");
    option2.style.color = "black"
    let option3 = document.createElement("option");
    option3.style.color = "black"
    let option4 = document.createElement("option");
    option4.style.color = "black"
    let option5 = document.createElement("option");
    option5.style.color = "black"

    if (vechicle_select.selectedIndex == 1) {
        // if Тент
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
        // if Изотерм
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
        // if Рефрижератор
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
        mkad_distance = getmyСlosestDistanceToPoly(JSON_marker_one, mkad_points, true); // measuring distance
        mkad_distance = roundNumber(mkad_distance, 0); // rounding distance
        mkad_distance_km = mkad_distance / 1000; // converting into kilometers
    }

    if (markers.length == 2) {
        // if there are 2 markers

        JSON_marker_one = markers[0].getPosition().toJSON(); // getting coordinates of the first marker
        JSON_marker_two = markers[1].getPosition().toJSON(); // getting coordinates of the second marker

        mkad_distance_one = getmyСlosestDistanceToPoly(JSON_marker_one, mkad_points, true);
        mkad_distance_two = getmyСlosestDistanceToPoly(JSON_marker_two, mkad_points, true);
        mkad_distance = mkad_distance_one + mkad_distance_two;

        mkad_distance = roundNumber(mkad_distance, 0); // rounding disrance in meters
        mkad_distance_km = mkad_distance / 1000; // converting into kilometers
        console.log("initial mkad_distance_km: ", mkad_distance_km)
    }
    // -- /checking if there's one or two markers on the map --

    // -- getting vehicle_select and cargo_select input --
    let vechicle_select = document.getElementById("vechicle_select").value;
    let cargo_select = document.getElementById("cargo_select").value;
    min_rate = cargo_select;

    vechicle_type = 0;
    switch (vechicle_select) {
        // counting min mkad_rate based on vehivle type

        case "Тент":
            vechicle_type = 1;
            break;
        case "Изотерм":
            vechicle_type = 2;
            break;
        case "Рефрижератор":
            vechicle_type = 3;
            break;
        case "Борт":
            vechicle_type = 4;
            break;
        case "Манипулятор":
            vechicle_type = 5;
            break;
    }

    inMoscow = inPoly(markersPosition[0], moscow_region_points, true)
    inMoscow2 = inPoly(markersPosition[1], moscow_region_points, true)

    if (inMoscow === true && inMoscow2 == true) {
        inMoscow = true;
    } else {
        inMoscow = false;
    }

    inPeter = inPoly(markersPosition[0], leningrad_region_points, false)
    inPeter2 = inPoly(markersPosition[1], leningrad_region_points, false)
    
    if (inPeter === true && inPeter2 == true || inMoscow == true) {
        inMoscow = true;
    } else {
        inMoscow = false;
    }

    console.log(inMoscow, "inMoscow")

    switch (true) {
        // Тент
        // inMoscow - находятся ли обе точки в московской области и ленинградской области
        case vechicle_type == 1 && cargo_select == 5000:
            points_cost = 500;
            mkad_rate = 30;

            if (!inMoscow) {
                mkad_rate = 40;
            }
            break;
        case vechicle_type == 1 && cargo_select == 6000:
            points_cost = 500;
            mkad_rate = 40;

            if (!inMoscow) {
                mkad_rate = 50;
            }
            break;
        case vechicle_type == 1 && cargo_select == 8000:
            points_cost = 1000;
            mkad_rate = 50;

            if (!inMoscow) {
                mkad_rate = 60;
            }
            break;
        case vechicle_type == 1 && cargo_select == 10000:
            points_cost = 1000;
            mkad_rate = 50;

            if (!inMoscow) {
                mkad_rate = 70;
            }
            break;
        case vechicle_type == 1 && cargo_select == 12000:
            points_cost = 1500;
            mkad_rate = 60;

            if (!inMoscow) {
                mkad_rate = 80;
            }
            break;

        // Изотерм
        case vechicle_type == 2 && cargo_select == 6000:
            points_cost = 1000;
            mkad_rate = 30;

            if (!inMoscow) {
                mkad_rate = 40;
            }
            break;
        case vechicle_type == 2 && cargo_select == 7000:
            points_cost = 1000;
            mkad_rate = 40;

            if (!inMoscow) {
                mkad_rate = 50;
            }
            break;
        case vechicle_type == 2 && cargo_select == 9000:
            points_cost = 1500;
            mkad_rate = 50;

            if (!inMoscow) {
                mkad_rate = 60;
            }
            break;
        case vechicle_type == 2 && cargo_select == 11000:
            points_cost = 1500;
            mkad_rate = 50;

            if (!inMoscow) {
                mkad_rate = 70;
            }
            break;
        case vechicle_type == 2 && cargo_select == 13000:
            points_cost = 2000;
            mkad_rate = 60;

            if (!inMoscow) {
                mkad_rate = 80;
            }
            break;

        // Рефрижератор
        case vechicle_type == 3 && cargo_select == 6000:
            points_cost = 500;
            mkad_rate = 40;

            if (!inMoscow) {
                mkad_rate = 50;
            }
            break;
        case vechicle_type == 3 && cargo_select == 7000:
            points_cost = 500;
            mkad_rate = 50;

            if (!inMoscow) {
                mkad_rate = 60;
            }
            break;
        case vechicle_type == 3 && cargo_select == 9000:
            points_cost = 500;
            mkad_rate = 60;

            if (!inMoscow) {
                mkad_rate = 70;
            }
            break;
        case vechicle_type == 3 && cargo_select == 11000:
            points_cost = 500;
            mkad_rate = 60;

            if (!inMoscow) {
                mkad_rate = 80;
            }
            break;
        case vechicle_type == 3 && cargo_select == 13000:
            points_cost = 500;
            mkad_rate = 70;

            if (!inMoscow) {
                mkad_rate = 90;
            }
            break;

        // Борт
        case vechicle_type == 4 && cargo_select == 6000:
            points_cost = 1000;
            mkad_rate = 30;

            if (!inMoscow) {
                mkad_rate = 40;
            }
            break;
        case vechicle_type == 4 && cargo_select == 7000:
            points_cost = 1000;
            mkad_rate = 40;

            if (!inMoscow) {
                mkad_rate = 50;
            }
            break;
        case vechicle_type == 4 && cargo_select == 9000:
            points_cost = 1000;
            mkad_rate = 50;

            if (!inMoscow) {
                mkad_rate = 60;
            }
            break;
        case vechicle_type == 4 && cargo_select == 11000:
            points_cost = 1000;
            mkad_rate = 50;

            if (!inMoscow) {
                mkad_rate = 70;
            }
            break;
        case vechicle_type == 4 && cargo_select == 13000:
            points_cost = 1500;
            mkad_rate = 60;

            if (!inMoscow) {
                mkad_rate = 80;
            }
            break;

        // Манипулятор
        case vechicle_type == 5 && cargo_select == 10000:
            points_cost = 1500;
            mkad_rate = 60;

            if (!inMoscow) {
                mkad_rate = 80;
            }
            break;
        case vechicle_type == 5 && cargo_select == 14000:
            points_cost = 2000;
            mkad_rate = 90;

            if (!inMoscow) {
                mkad_rate = 110;
            }
            break;
    }

    console.log("-------------------------")
    console.log("mkad_rate = " + mkad_rate)
    console.log("vechicle_type = " + vechicle_type)
    console.log("cargo_select = " + cargo_select)
    console.log("inMoscow = " + inMoscow)
    console.log("-------------------------")
    // -- /getting vehicle_select and cargo_select input --

    // -- getting input from newThirdSection --
    // if (document.getElementById("to_Sadovoe").checked) {
    //     Sadovoe_points = 1;
    // } else {
    //     Sadovoe_points = 0;
    // }

    Sadovoe_points = 0;
    TTK_points = 0;

    // if (document.getElementById("to_TTK").checked) {
    //     TTK_points = 1;
    // } else {
    //     TTK_points = 0;
    // }

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
    if (!inMoscow) {
        min_rate = 0
        mkad_distance_km = roundNumber(distance / 1000, 3)
    }

    if (inPoly(markersPosition[0], leningrad_region_points, false) && inPoly(markersPosition[1], leningrad_region_points, false)) {
        console.log("both markers in petersburg")

        JSON_marker_one = markers[0].getPosition().toJSON(); // getting coordinates of the first marker
        JSON_marker_two = markers[1].getPosition().toJSON(); // getting coordinates of the second marker

        mkad_distance_one = getmyСlosestDistanceToPoly(JSON_marker_one, kad_points, false);
        mkad_distance_two = getmyСlosestDistanceToPoly(JSON_marker_two, kad_points, false);
        mkad_distance = mkad_distance_one + mkad_distance_two;

        mkad_distance = roundNumber(mkad_distance, 0); // rounding disrance in meters
        mkad_distance_km = mkad_distance / 1000; // converting into kilometers
    }

    mkad_cost = mkad_distance_km * mkad_rate;
    // console.log(mkad_distance_km, mkad_rate);
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
        "Итого: " + totalcost + " руб. с учётом 20% НДС"; // displaying total cost
}

var final_message = "";
var final_button_Pressed = false;
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

    // if (document.getElementById("to_Sadovoe").checked) {
    //     Sadovoe_points = "Да";
    // } else {
    //     Sadovoe_points = "Нет";
    // }

    Sadovoe_points = "Нет";
    TTK_points = "Нет";

    // if (document.getElementById("to_TTK").checked) {
    //     TTK_points = "Да";
    // } else {
    //     TTK_points = "Нет";
    // }

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
  Грузоподъёмность тс: ${document.getElementById("cargo_select").options[document.getElementById("cargo_select").selectedIndex].text}<br>
  Дата погрузки: ${loadDate}<br>
  Дата выгрузки: ${unloadDate}<br>
  Итоговая цена: ${price} руб.<br>
  <br>
  Комментарий к заказу: ${comment}<br>
  `;

    if (final_button_Pressed === false) {
        Email.send({
            Host: "smtp.euroexpress.msk.ru",
            Username: "noreply@euroexpress.msk.ru",
            Password: "D8r8M9y6",
            To: "euroexpress_logist@bk.ru",
            From: "noreply@euroexpress.msk.ru",
            Subject: "EuroExpress - Новый отклик!",
            Body: final_message,
        })
        console.log(final_message)
    } else {
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
    
}

 function final_button() {

    // requiredField_isField_1 = document.getElementById("AltLoad_points").value == ""
    requiredField_isField_2 = document.getElementById("pac-input").value == ""
    requiredField_isField_3 = document.getElementById("pac-inputTwo").value == ""
    requiredField_isField_4 = document.getElementById("vechicle_select").value == "0"
    requiredField_isField_5 = document.getElementById("phone").value == ""
    isField = [!requiredField_isField_2, !requiredField_isField_3, !requiredField_isField_4, !requiredField_isField_5]
    
    let completed = true
    
    for (let i = 0; i < isField.length; i++) {
        if (isField[i] === false) {
            // console.log(i)
            completed = false
        }
    }
    
    if (completed === false) {
        document.getElementById("costLabel").innerHTML = 'Заполните все поля, помеченные "*"'
        return
    }

    if (final_button_Pressed === false) {
        countCost()
        submitData()
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

$(document).ready(function(){
    $("#phone").on("input", function(){
        // Print entered value in a div box
        // console.log($(this).val())
        new_value = $(this).val()
        
        final_button_Pressed = false
        document.getElementById("submit").innerHTML = "Расчитать стоимость"
    });
});

$(document).ready(function(){
    $("#pac-input").on("input", function(){
        // Print entered value in a div box
        // console.log($(this).val())
        new_value = $(this).val()
        
        final_button_Pressed = false
        document.getElementById("submit").innerHTML = "Расчитать стоимость"
    });
});

$(document).ready(function(){
    $("#pac-inputTwo").on("input", function(){
        // Print entered value in a div box
        // console.log($(this).val())
        new_value = $(this).val()
        
        final_button_Pressed = false
        document.getElementById("submit").innerHTML = "Расчитать стоимость"
    });
});

$(document).ready(function(){
    $("#vechicle_select").on("input", function(){
        // Print entered value in a div box
        // console.log($(this).val())
        new_value = $(this).val()
        
        final_button_Pressed = false
        document.getElementById("submit").innerHTML = "Расчитать стоимость"
    });
});

$(document).ready(function(){
    $("#cargo_select").on("input", function(){
        // Print entered value in a div box
        // console.log($(this).val())
        new_value = $(this).val()
        
        final_button_Pressed = false
        document.getElementById("submit").innerHTML = "Расчитать стоимость"
    });
});