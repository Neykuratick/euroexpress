
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


var markers = [];
var markersPosition = [];

let map;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 55.91091259697019, lng: 37.890153590767405 },
    zoom: 15,
    gestureHandling: "greedy",
    streetViewControl: false,
    mapTypeControl: true
  });

  map.addListener("click", (e) => {
    console.log("--------------------------")
    if (markers.length > 1) {
      markers = [];
      markersPosition = [];
      document.getElementById("point2").innerHTML = "Ваша вторая точка: ";
    }

    markers.push(placeMarkerAndPanTo(e.latLng, map))

    if (markers.length < 2) {
      var marPos = markers[0].getPosition().toJSON()
      markersPosition.push(jsonToArray(marPos))
      
      adress = geocode(markersPosition[0])
      document.getElementById("point1").innerHTML = "Ваша первая точка: " + adress;
    }

    if (markers.length == 2) {
      var marPos = markers[1].getPosition().toJSON()
      markersPosition.push(jsonToArray(marPos))

      adress = geocode(markersPosition[1])
      document.getElementById("point2").innerHTML = "Ваша вторая точка: " + adress;
    }
    
    console.log("markersPosition", markersPosition)

  })
}

function placeMarkerAndPanTo(latLng, map) {
  marker = new google.maps.Marker({
    position: latLng,
    map: map,
  })
  map.panTo(latLng)
  return marker
}

function jsonToArray(json) {
  var array = []
  array.push(json.lat)
  array.push(json.lng)
  return array
}

function geocode(latLngArray) {
  requestURL = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latLngArray[0] + ',' + latLngArray[1] + '&key=AIzaSyBqQWVdLdaFiMVjeVJY9nCrG617KMJoPa0'
  apiResponse = JSON.parse(httpGet(requestURL))
  return apiResponse.results[0].formatted_address;
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.response;
}