// Leah Bates adpated tutorial

//2.3 and 2.4
// var mymap = L.map("mapid").setView([ 0, 0], 2);

// // add typle layer
// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
//     maxZoom: 19,
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(mymap);

// //simple GeoJSON features
// var geojsonFeature = {
//     "type": "Feature",
//     "properties": {
//         'City': "Tokyo",
//         "Pop_1985": 30.30,
//         "Pop_1990": 32.53,
//         "Pop_1995": 33.59,
//         "Pop_2000": 34.45,
//         "Pop_2005": 35.62,
//         "Pop_2010": 36.83,
//         "Pop_2015": 38
//     },
//     "geometry":{
//         "type":"Point",
//         "coordinates": [139.8089447, 35.6832085]
//     }
// };

// // GeoJSON objects added to the map
// L.geoJSON(geojsonFeature).addTo(mymap);


// // here we are trying to dynamically  add data
// fetch("data/MegaCities.geojson")
//     .then(function(response){
//         return response.json();
//     })
//     .then(function(json) {
//         L.geoJSON(json).addTo(mymap);
//     });

// document.addEventListener('DOMContentLoaded', createMap)

//2.5

// var map;

// //function to instantiate the leaflet map
// function createMap(){
//     //create map
//     map = L.map('mapid', {
//         center: [20, 0],
//         zoom: 2
//     });

//     //add OSM base tilelayer
//     L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
//         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
//     }).addTo(map);

//     //calls the getData function
//     getData();
// };

// function getData (){
//     //load the data
//     fetch('data/MegaCities.geojson')
//         .then(function(response){
//             return response.json();
//         })
//         .then(function(json){
//             //create marker options
//             var geojsonMarkerOptions = {
//                 radius: 8,
//                 fillColor: "#ff7800",
//                 color: "#000",
//                 weight: 1,
//                 opacity: 1, 
//                 fillOpacity: 0.8
//             };
//             //create a leaflet geojson layer and add it to the map
//              L.geoJson(json, {
//                 pointToLayer: function (feature, latlng){
//                     return L.circleMarker(latlng, geojsonMarkerOptions);
//                 }
//             }).addTo(map);
//         })
// };

// document.addEventListener('DOMContentLoaded', createMap)


//2.5

var map;

//function to instantiate the leaflet map
function createMap(){
    //create map
    map = L.map('mapid', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //calls the getData function
    getData();
};


function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

        
//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/MegaCities.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                onEachFeature: onEachFeature
            }).addTo(map);
        })  
};

document.addEventListener('DOMContentLoaded', createMap)