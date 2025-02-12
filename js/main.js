
var map;
var minValue;

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
        fillColor : "#ff7800",
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
    var popupContent = "<p><b>County:</b>" + feature.properties.County + "</p><p><b>" + attribute + ":</b>" + feature.properties[attribute] + "</p>";

    //bind the popup  to the circle marker with an offset to avoid overlap
    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -options.radius)
    });

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
    // create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector('#panel').insertAdjacentHTML('beforeend',slider);

    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    //add buttons
    document.querySelector("#panel").insertAdjacentHTML('beforeend', '<button class="step" id="reverse">Reverse</button>');
    document.querySelector("#panel").insertAdjacentHTML('beforeend', '<button class="step" id="forward">Forward</button>');

    //should replace the buttons with the images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/backward_arrow.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward_arrow.png'>")

    // click listener for buttons
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            //increment or decrement depending on button clicked
            var index = document.querySelector('.range-slider').value;

            if (step.id == 'forward'){
                index++;
                //if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };
            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index])
        })
    })
    //input listener for slider
    document.querySelector(".range-slider").addEventListener('input',function(){
        //get the new index value
        var index = this.value;
        console.log(index)
        updatePropSymbols(attributes[index])
    });
}

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

//function to resize proportional symbols accrording to new attribute vlaues
function updatePropSymbols(attribute) {
    map.eachLayer(function(layer){
        if(layer.feature && layer.feature.properties[attribute]){
            // access feature properties
            var props = layer.feature.properties;

            //update each feature radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add county to popup content string
            var popupContent = "<p><b>County:</b>" + props.County + "</p";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Child Poverty Rate in" + year + ":</b>" + props[attribute];

            //update popup content
            popup = layer.getPopup();
            popup.setContent(popupContent).update();
        };
    });
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
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json,map,attributes); //not the attributes variable that will store the array
            //function that creates the sequence control
            createSequenceControls(attributes);
        })  
};

document.addEventListener('DOMContentLoaded', createMap)