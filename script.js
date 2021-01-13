
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

ymaps.ready(init);
var coordinates;
function init() {
     var myMap = new ymaps.Map("map", {
          center: [55.76, 37.64],
          zoom: 10,
          controls: []
     });

     myMap.controls.add('zoomControl');
     myMap.controls.add('searchControl');
     myMap.controls.add('typeSelector');


     var searchControl = myMap.controls.get('searchControl');

     searchControl.events.add('submit', function (e) {
          // console.log(searchControl.getResultsArray());
     }, this);

     searchControl.events.add("resultselect", function (e) {
               console.log("grege");
               var resString = searchControl.getRequestString();
               console.log(resString);
               var myGeocoder = ymaps.geocode(resString);
               myGeocoder.then(
                    function (res) {
                         // Выведем в консоль данные, полученные в результате геокодирования объекта.
                              var cords = res.geoObjects.get(0).properties.get("boundedBy")[0];
                              var cordss = res.geoObjects.get(0).properties.get("boundedBy")[1];
                              var finalx = cords[0] + cordss[0]
                              var finalx = finalx / 2;
                              var finaly = cords[1] + cordss[1]
                              var finaly = finaly / 2;
                              coordinates = [finalx, finaly];
                              console.log(coordinates)
                         },
                    function (err) {
                         // Обработка ошибки.
                    });
          }
     );

}