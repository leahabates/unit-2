
var map;

//function to instantiate the leaflet map
function createMap(){
    //create map
    map = L.map('mapid').setView([43.0722,-89.398422], 12.5);

    //add OSM base tilelayer
    L.tileLayer('https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png',{
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.openstreetmap.cat" target="_blank">Breton OpenStreetMap Team</a>' 
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
    fetch("data/bbikeStations.geojson")
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