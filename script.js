// ------------------------------------- global -------------------------------------------------------

function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
  xmlHttp.send( null );
  return xmlHttp.response;
}

function jsonToArray(json) {
  var array = []
  array.push(json.lat)
  array.push(json.lng)
  return array
}

function roundNumber(num, dec) {
  const [sv, ev] = num.toString().split('e');
  return Number(Number(Math.round(parseFloat(sv + 'e' + dec)) + 'e-' + dec) + 'e' + (ev || 0));
}

// ------------------------------------- /global -------------------------------------------------------

// ------------------------------------- slider -------------------------------------------------------
var slides=document.querySelector('.slider-items').children;
var nextSlide=document.querySelector(".right-slide");
var prevSlide=document.querySelector(".left-slide");
var totalSlides=slides.length;
var index=0;

nextSlide.onclick=function () {
     next("next");
}
prevSlide.onclick=function () {
     next("prev");
}

function next(direction){

   if(direction=="next"){
      index++;
       if(index==totalSlides){
        index=0;
       }
   }
   else{
           if(index==0){
            index=totalSlides-1;
           }
           else{
            index--;
           }
    }

  for(i=0;i<slides.length;i++){
          slides[i].classList.remove("active");
  }
  slides[index].classList.add("active");     

}

// ------------------------------------- /slider -------------------------------------------------------


// ------------------------------------- map -------------------------------------------------------


var markers = [];
var markersPosition = [];
var distance;

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
    mapTypeControl: true
  });

  map.addListener("click", (e) => {

    // -------------------------------------------------------

    clear()
    markers.push(placeMarkerAndPanTo(e.latLng, map))
    getAdressAndDistance()

    // -------------------------------------------------------
  })
}

function initAutocomplete() {
  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });
  let markersLocal = [];
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

      
      clear()
      markers.push(markersLocal[0])
      placeMarkerAndPanTo(markersLocal[0].getPosition(), map)
      getAdressAndDistance()

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

function placeMarkerAndPanTo(latLng, map) {
  marker = new google.maps.Marker({
    position: latLng,
    map: map,
  })
  map.panTo(latLng)
  return marker
}

function geocode(latLngArray) {
  requestURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latLngArray[0] + ',' + latLngArray[1] + '&key=AIzaSyBqQWVdLdaFiMVjeVJY9nCrG617KMJoPa0'
  apiResponse = JSON.parse(httpGet(requestURL))
  return apiResponse.results[0].formatted_address;
}

var rad = function(x) {
  return x * Math.PI / 180;
};

function getDistance(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};

function clear() {
  if (markers.length > 1) {
    markers = [];
    markersPosition = [];
    distance = 0;
    document.getElementById("point2").innerHTML = ""; // Ваша вторая точка:
    document.getElementById("distance").innerHTML = ""; // Расстояние
  }
}

function getAdressAndDistance() {
  if (markers.length < 2) {
    var marPos = markers[0].getPosition().toJSON()
    markersPosition.push(jsonToArray(marPos))
    
    adress = geocode(markersPosition[0])
    document.getElementById("point1").innerHTML = "" + adress;
  }

  if (markers.length == 2) {
    var marPos = markers[1].getPosition().toJSON()
    markersPosition.push(jsonToArray(marPos))

    adress = geocode(markersPosition[1])
    document.getElementById("point2").innerHTML = "" + adress;

    marker1 = markers[0].getPosition()
    marker2 = markers[1].getPosition()
    distance = getDistance(marker1, marker2)
    document.getElementById("distance").innerHTML = "Расстояние: " + roundNumber(distance / 1000, 3) + " километров";
  }
  
  // console.log("markersPosition", markersPosition)
  // console.log("markers", markers)
}

// ------------------------------------- /map -------------------------------------------------------