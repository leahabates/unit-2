
var map;
var minValue;
var dataStats = {};

//function to instantiate the leaflet map
function createMap(){
    //create map
    map = L.map('mapid').setView([44.75,-89.5], 7);

    //add OSM base tilelayer
    L.tileLayer('https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png',{
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.openstreetmap.cat" target="_blank">Breton OpenStreetMap Team</a>' 
        }).addTo(map);

    console.log(L.tileLayer.providers);

     L.tileLayer.provider('CartoDB.Positron').addTo(map)

        // Add the geocoder control
    L.Control.geocoder({
        geocoder: L.Control.Geocoder.nominatim(),
        defaultMarkGeocode: false,
        placeholder: "Search for a location...",
        collapsed: false, // Set to true if you want it to be initially collapsed
    }).on('markgeocode', function (e) {
        // This function is called when a location is selected
        var latlng = e.geocode.center;
        var zoom = 12; // You can set your desired zoom level
        map.setView(latlng, zoom);
    }).addTo(map);

    //add describtion of data
    createDescriptionControl();

    //add title control
    createTitleControl();

    //calls the getData function
    getData();
};

function createDescriptionControl() {
    var DescriptionControl = L.Control.extend({
        options: {
            position: 'bottomleft'  // Position where you want the description to appear (e.g., 'topright', 'bottomleft')
        },

        onAdd: function () {
            // Create the container for the description
            var container = L.DomUtil.create('div', 'description-container');
            
            // Add description text to the container
            container.innerHTML = `
                <h3>Data Source and Explanation</h3>
                <p>This map visualizes child poverty rates by county from 2017 to 2023. The data was sourced from US Census Bureau.</p>
                <p>The poverty rate is calculated as the percentage of children living below the poverty line in each county.</p>
                <p>Use the slider and buttons to explore data across different years.</p>
            `;
            
            // Style the description (optional)
            container.style.background = 'rgba(255, 255, 255, 0.7)';
            container.style.padding = '10px';
            container.style.borderRadius = '5px';
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.fontSize = '12px';
            
            return container;
        }
    });

    map.addControl(new DescriptionControl());
}

function createTitleControl() {
    var TitleControl = L.Control.extend({
        options: {
            position: 'topleft'  // You can change this to 'topright', 'bottomleft', etc.
        },

        onAdd: function () {
            // Create the container for the title
            var container = L.DomUtil.create('div', 'map-title-container');
            
            // Add the title text to the container
            container.innerHTML = '<h3>Child Poverty Rates in Wisconsin</h3>';
            
            // Style the title (optional)
            container.style.background = 'rgba(255, 255, 255, 0.7)';
            container.style.padding = '10px';
            container.style.borderRadius = '5px';
            container.style.fontFamily = 'Arial, sans-serif';
            container.style.fontWeight = 'bold';
            container.style.fontSize = '25px';
            
            return container;
        }
    });

    map.addControl(new TitleControl());
}

function calcStats(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each county
    for(var County of data.features){
        //loop through each year
        for(var year = 2017; year <= 2023; year+=1){
              //get population for current year
              var value = County.properties["yr_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get min, max, mean stats for our array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;

}    

function createPopupContent (properties, attribute){
    //add county to popup content string
    var popupContent = "<p><b>County:</b> " + properties.County + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Child Poverty Rate in " + year + ": </b>" + properties[attribute] + "%";

    return popupContent;
}

function calculateMinValue(data){
    // create an empy array to store the data values
    var allValues =[];
    for (var County of data.features){
        for (var year = 2017; year <= 2023; year+=1){
            //get population for current year
            var value = County.properties["yr_"+ String(year)];
            // add values to array
            allValues.push(value);
        }
    }
    // get minimum value of the array
    var minValue = Math.min(...allValues)

    return minValue;
}


function calcPropRadius(attValue){
    //constant that will be used to adjust the size of the symbol evenly
    var minRadius = 5;
    // flannery apperance compesation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715)*minRadius

    return radius;
}

//fucntion to convert markers to circles markers
function pointToLayer(feature, latlng, attributes){
    var attribute = attributes[0];

    //check
    console.log(attribute)

    //create marker option
    var options = {
        fillColor : "#ff0000",
        color : "#000",
        weight : 1,
        opacity : 1,
        fillOpacity : 0.8
    };

    // for each feature determine it value for the selected value
    var attValue = Number(feature.properties[attribute]);

    //give each circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng,options);

    //build popup content string
    var popupContent = createPopupContent(feature.properties, attribute);

    //bind the popup  to the circle marker with an offset to avoid overlap
    layer.bindPopup(popupContent, { offset: new L.Point(0, -options.radius)});

    //return the circle marker to the L.geoJson pointToLayer option
    return layer; 
}

 // add cirlcle markers for point features to the map
function createPropSymbols(data, map, attributes){

    //create a leaflet GeoJSON layer and add it to map
    L.geoJson(data, {
        pointToLayer : function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//create new sequence controls
 function createSequenceControls(attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            //set slider attributes
            container.querySelector(".range-slider").max = 6;
            container.querySelector(".range-slider").min = 0;
            container.querySelector(".range-slider").value = 0;
            container.querySelector(".range-slider").step = 1;

            //add skip buttons
            container.insertAdjacentHTML('beforeend','<button class="step" id="reverse" title="Reverse"><img src="img/backward_arrow.png"></button>'); 
            container.insertAdjacentHTML('beforeend','<button class="step" id="forward" title="Forward"><img src="img/forward_arrow.png"></button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }

    });

    map.addControl(new SequenceControl());   

    // click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            //increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                // if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                // if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };

            //update slider
            document.querySelector('.range-slider').value = index;

            // pass new attribute to update symbols
            updatePropSymbols(attributes[index]);

            // update legend as well
            updateLegend(attributes[index]);
        })

    })

    // input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){            
        var index = this.value;
        // pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
        // update legend as well
        updateLegend(attributes[index]);  
    });
};

//function to bueld the attributes array 
function processData(data){
    //empty array to hold the attributes
    var attributes =[];

    //properties of the firest feature in the dataset
    var properties = data.features[0].properties;

    //pushes each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with child poverty rates values
        if (attribute.indexOf("yr") > -1){
            attributes.push(attribute);
        };
    };
    //check result
    console.log(attributes);

    return attributes;
}
function LegendContent (attribute){
    this.year = attribute.split("_")[1];
    this.formatted = '<p class="legend-content"><b> Child Poverty Rates in <span class="year">2017</span></b></p>'
};

function createLegend(attributes) {
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            var container = L.DomUtil.create('div', 'legend-control-container');

            container.innerHTML = '<p class="legend-control-container">Child Poverty Rates in <span class="year">2017</span></p>';

            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            

            //array of circles names to base loop on
            var circles = ["max","mean", "min"];

            // loop to add each circ;e and text to svg string
            for (var i=0; i<circles.length; i++){
                // assign the r and cy attributes
                var radius = calcPropRadius(dataStats[circles[i]]);
                var cy = 59 - radius;
                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#ff0000" fill-opacity="0.8" stroke="#000000" cx="30"/>';

                //evenly space out labels            
                var textY = i * 20 + 20;            

            //text string            
                svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + "%" + '</text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend to container
            container.insertAdjacentHTML('beforeend', svg)

            return container;
        }
    });

    map.addControl(new LegendControl());
}

function updateLegend(attribute,data) {
    var year = attribute.split("_")[1];  // Get the year from the attribute

    //recalculate the stats for selected year
    calcStatsForYear(year, data); 
    
    document.querySelector("span.year").innerHTML = year;

    //update legend with new min, mean, and max value
    updateLegendMarkers();
};

function calcStatsForYear(year, data) {
    var allValues = [];

    for (var County of data.features) {
        var value = County.properties["yr_" + year];
        if (value !== null) {  // Ensure we're not dealing with a null value
            allValues.push(value);
        }
    }

    // Recalculate min, max, and mean for the selected year
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    var sum = allValues.reduce(function(a, b) { return a + b; });
    dataStats.mean = sum / allValues.length;
}

function updateLegendMarkers() {
    var svg = document.querySelector('#attribute-legend');
    
    // Update the circles for min, mean, max with new values
    var circles = ["max", "mean", "min"];

    circles.forEach(function(circle) {
        var radius = calcPropRadius(dataStats[circle]);
        var cy = 59 - radius;

        // Update the circle radius and text value
        document.querySelector("#" + circle).setAttribute('r', radius);
        document.querySelector("#" + circle).setAttribute('cy', cy);
        document.querySelector("#" + circle + '-text').textContent = Math.round(dataStats[circle] * 100) / 100 + "%";
    });
}

function createSequenceControls(attributes, data) {
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function () {
            var container = L.DomUtil.create('div', 'sequence-control-container');
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')
            container.querySelector(".range-slider").max = 6;
            container.querySelector(".range-slider").min = 0;
            container.querySelector(".range-slider").value = 0;
            container.querySelector(".range-slider").step = 1;
            container.insertAdjacentHTML('beforeend','<button class="step" id="reverse"><img src="img/backward_arrow.png"></button>'); 
            container.insertAdjacentHTML('beforeend','<button class="step" id="forward"><img src="img/forward_arrow.png"></button>');
            L.DomEvent.disableClickPropagation(container);
            return container;
        }
    });

    map.addControl(new SequenceControl());

    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            if (step.id == 'forward'){
                index++;
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                index = index < 0 ? 6 : index;
            }

            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index],data);
            updateLegend(attributes[index],data); // Update the legend when changing year
        });
    });

    document.querySelector('.range-slider').addEventListener('input', function(){
        var index = this.value;
        updatePropSymbols(attributes[index],data);
        updateLegend(attributes[index],data);  // Update the legend when slider is adjusted
    });
}


//function to resize proportional symbols accrording to new attribute vlaues
function updatePropSymbols(attribute, data) {
    map.eachLayer(function(layer){
        if(layer.feature && layer.feature.properties[attribute]){
            // access feature properties
            var props = layer.feature.properties;

            //update each feature radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add county to popup content string
            var popupContent = createPopupContent(props, attribute);

            //update popup content
            popup = layer.getPopup();
            popup.setContent(popupContent).update();
        };
    });
    updateLegend(attribute, data)
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/childPovRates.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json);

            //calc sates
            calcStats(json);

            minValue=dataStats.min

    
            //call function to create proportional symbols
            createPropSymbols(json,map,attributes); //not the attributes variable that will store the array
            // ensure legend is created 
            createLegend(attributes);
            // update the legend with the first attribute
            updateLegend(attributes[0], json)
            //function that creates the sequence control
            createSequenceControls(attributes, json);
        })  
};

document.addEventListener('DOMContentLoaded', createMap)