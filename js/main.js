
var map;

//function to instantiate the leaflet map
function createMap(){
    //create map
    map = L.map('mapid').setView([45,-89.5], 7);

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
function pointToLayer (feature,latlng){

    var radius = 8
    var color = "#FF0000";

    return L.circleMarker(latlng, {
        radius : radius,
        color : color,
        filllColor : color,
        fillOpacity: 0.6
    });
}
        
//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/childPovRates.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json, {
                onEachFeature: onEachFeature,
                pointToLayer: pointToLayer
            }).addTo(map);
        })  
};

document.addEventListener('DOMContentLoaded', createMap)