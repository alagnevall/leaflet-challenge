// URL to earthquake json data
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";
var plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 5;
}

// function to return the color based on magnitude
function markerColor(magnitude) {
  if (magnitude > 4) {
    return 'red'
  } else if (magnitude > 3) {
    return 'orange'
  } else if (magnitude > 2) {
    return 'yellow'
  } else {
    return 'green'
  }
}

// // function for opacity based on magnitude
function markerOpacity(magnitude) {
  if (magnitude > 6) {
    return .99
  } else if (magnitude > 5) {
    return .80
  } else if (magnitude > 4) {
    return .70
  } else if (magnitude > 3) {
    return .60
  } else if (magnitude > 2) {
    return .50
  } else if (magnitude > 1) {
    return .40
  } else {
    return .30
  }
}

// GET request, and function to handle returned JSON data
d3.json(queryUrl, function(data) {
    // console.log("d3.json");
    createFeatures(data.features);
    
});

// GET request, and function to handle returned JSON data
d3.json(plateUrl, function(data) {
    // console.log("d3.json");
    createPlates(data.features);
    
});

var earthquakeMarkers = [];
function addMarker(feature, location) {
    // console.log("addMarker");
    var options = {
        stroke: false,
        fillOpacity: markerOpacity(feature.properties.mag),
        color: markerColor(feature.properties.mag),
        fillColor: markerColor(feature.properties.mag),
        radius: markerSize(feature.properties.mag)
    }
    
    // popup describing the place and time of the earthquake
    earthquakeMarkers.push(L.circleMarker([location[1],location[0]], options)
    .bindPopup(`<h3> ${feature.properties.place} </h3> <hr> <h4>Magnitude: ${feature.properties.mag} </h4> <p> ${Date(feature.properties.time)} </p>`)
    );
    
};

var tecLines = [];
function createPlates(plateData){
    var tec = L.geoJSON(plateData, {
        style: function(feature) {
            return {
              color: "white",
              weight: 1.5
            };
          }
    });
    tecLines.push(tec);
};

function createFeatures(earthquakeData) {
    // console.log("createFeatures");
    
    function onEachFeature(feature, layer) {
        // console.log("onEachFeature");
        addMarker(feature, feature.geometry.coordinates)
    }

    var earthquakes = L.geoJSON(earthquakeData, {
      // onEachFeature : addPopup(data.features, layer),
      onEachFeature: onEachFeature
    });

    // call function to create map
    createMap(earthquakes);
}
// function to receive a layer of markers and plot them on a map.
function createMap(earthquakes) {
    // console.log("createMap");
    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });
  
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });
  
    var qMarker = L.layerGroup(earthquakeMarkers);
    var tMarker = L.layerGroup(tecLines);

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: qMarker,
      Plates: tMarker
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [streetmap, qMarker, tMarker]
    });
  
    // creating the legend
    var legend = L.control({position: 'bottomright'});

    // add legend to map
    legend.onAdd = function () {
    
        var div = L.DomUtil.create('div', 'info legend leaflet-control-layers')
        
        div.innerHTML = "<h3>Magnitude Legend</h3><table><tr><th>>= 4</th><td>Red</td></tr><tr><th>>= 3</th><td>Orange</td></tr><tr><th>>= 2</th><td>Yellow</td></tr><tr><th>< 2</th><td>Green</td></tr></table>";

        return div;
    };
    
    legend.addTo(myMap);

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

  }

