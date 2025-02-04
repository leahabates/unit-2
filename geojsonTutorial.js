// Leah Bates Using GeoJSON with Leaflet

var mymap = L.map("mapid").setView([ 39.75621, -104.99404], 4);

// add typle layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

//simple GeoJSON features
var geojsonFeature = {
	"type": "Feature",
	"properties": {
		'name': "Coors Feild",
		"amenity":"Baseball Stadium",
		"popupContent":"This is where the Rockies play!"
	},
	"geometry":{
		"type":"Point",
		"coordinates": [-104.99404, 39.75621]
	}
};

// GeoJSON objects added to the map
L.geoJSON(geojsonFeature).addTo(mymap);

//GeoJSON objects may also be passses as an arrray of valid GeoJSON objects
var myLines = [{
	"type": 'LineString',
	"coordinates": [[-100,40], [-105,45], [-110,55]]
},{
	"type":"LineString",
	"coordinates": [[-105, 40],[-110,45],[-115,55]]
}];

// alternatively wer can create an empty GeoJSON layer and assignt it to a variable so we can add more features to it later
var myLayer = L.geoJSON().addTo(mymap);
myLayer.addData(geojsonFeature);

//the style ooption can be used to style features differnt ways
var myStyle = {
	'color': '#ff7800',
	"weight":5,
	"opacity": 0.65
};

L.geoJSON(myLines,{
	style: myStyle
}).addTo(mymap);

///or we can pass a fuction that styles individual features based on their properties
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJSON(states, {
	style: function(feature){
	return feature.properties.party === "Republican" ? { color: "#ff0000" } : { color: "#0000ff" };
	}
}).addTo(mymap);

//points are different, by default simple markers are drawn for GeoJSON points. can alter this by pointToLayer function

var geojsonMarkerOptions = {
	radius: 8,
	fillColor: "#ff7800",
	color: "#000",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.8
};

// L.geoJSON(someGeojsonFeature, {
// 	pointToLayer: function(feature, latlng){
// 		return L.circleMarker(latlng, geojsonMarkerOptions);
// 	}
// }).addTo(mymap);

// onEachFeature option is a funciton that gets called on each feature before adding it to a GeoJSON layer. Common reason to use this is to attach a popupfeature when clicke
function onEachFeature(feature, layer){
	if(feature.properties && feature.properties.popupContent){
		layer.bindPopup(feature.properties.popupContent);
	}
}

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(mymap);

// filters are coptions to control the visability of geojson features
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(mymap);
