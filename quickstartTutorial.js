// Leah Bates quickstartTutorial.js

var mymap = L.map("mapid").setView([51.505, -0.09], 13);

// add typle layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap)

// added marker
var marker = L.marker([51.5,-0.09]).addTo(mymap);

// added circle
var circle = L.circle([51.508, -0.11],{
	color: 'red',
	fillcolor: "#f03",
	fillOpacity: 0.5,
	radius: 500,
}).addTo(mymap);

//added polygon
var polygon = L.polygon([
	[51.509,-0.08],
	[51.503, -0.06],
	[51.51, -0.047]
]).addTo(mymap);

// popup shortcuts. bindPopup attaches a popo with the specified HTML content
marker.bindPopup("<b>Hello World!</b><br>I am a popup.").openPopup(); // openPop() works for markers only and immedeatly opens attached popup
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon");

//using a popup as a layer(when you need something more than attaching a popup to an object)
var popup = L.popup()
	.setLatLng([51.513,-0.09])
	.setContent("I am a standalone popup.")
	.openOn(mymap); //used openOn because it handles automatic closing of perviously open popup when opening a new one, good for usability

//dealing with events
var popup = L.popup();

function onMapClick(e){
	popup 
		.setLatLng(e.latlng)
		.setContent("You clicked the map at " + e.latlng.toString())
		.openOn(mymap);
}
mymap.on('click', onMapClick);

