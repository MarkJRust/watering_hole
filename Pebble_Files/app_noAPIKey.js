var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');

var parseFeed = function(data, quantity) {
  var items = [];
  for(var i = 0; i < quantity; i++) {
    // Always upper case the description string

    var title = data.results[i].name;
    
    //title = title.charAt(0).toUpperCase() + title.substring(1);

    // Get date/time substring
    var location = data.results[i].vicinity;
    //location = location.substring(location.indexOf('-') + 1, location.indexOf(':') + 3);

    // Add to menu items array
    items.push({
      title:title,
      subtitle:location
    });
  }

  // Finally return whole array
  console.log(items);
  return items;
};

// Show splash screen while waiting for data
var splashWindow = new UI.Window();

// Text element to inform user
var text = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'Downloading bar data...',
  font:'GOTHIC_28_BOLD',
  color:'black',
  textOverflow:'wrap',
  textAlign:'center',
	backgroundColor:'white'
});

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();
console.log('WE MADE THE CARDS\n\n');

//Get user location
var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

var location;
var finalLocation;

function locationSuccess(pos) {
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
  var lat = pos.coords.latitude.toString();
  var long = pos.coords.longitude.toString();
  location = lat + ',' + long;
  finalLocation = location.toString();
  
  console.log('FINAL location: ' + finalLocation);
  console.log('LOCATION ABOVE?\n');
  
  console.log("1: " + finalLocation);
  
var theURL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+finalLocation+'&radius=32000&types=bar&opennow&key=YOURKEYHERE';
var theFullURL = theURL.toString();
console.log(theFullURL);
console.log('\n\n');
// Make request to Google Places API
ajax(
  {
    url: theFullURL,
    type:'json'
  },
  function(data) {
    // Create an array of Menu items
    console.log(JSON.stringify(data));
    
    var menuItems = parseFeed(data, 6);

    // Construct Menu to show to user
    var resultsMenu = new UI.Menu({
      sections: [{
        title: 'Watering Hole:',
        items: menuItems
      }]
    });

    // Add an action for SELECT
resultsMenu.on('select', function(e) {
  // Get that forecast
  console.log(e.itemIndex);
  var bar = data.results[e.itemIndex];

  // Assemble body string
  var content = "";

  // Capitalize first letter
  //content = content.charAt(0).toUpperCase() + content.substring(1);

  var price_level_int = parseInt(data.results[e.itemIndex].price_level);
    
  var priceString = "";
    for(var i=0; i<price_level_int; i++)
      {
        
        priceString = priceString +"$";
        
      }
  
  // Add temperature, pressure etc
  content += 'Address: ' + bar.vicinity+'\nRating: '+bar.rating+'/5' + '\nPrice: ' + priceString;

      // Create the Card for detailed view
      var detailCard = new UI.Card({
        title:'Details',
        subtitle:data.results[e.itemIndex].name,
        body: content,
        scrollable:true
      });
      detailCard.show();
    });

    // Show the Menu, hide the splash
    resultsMenu.show();
    splashWindow.hide();
    
    // Register for 'tap' events
    resultsMenu.on('accelTap', function(e) {
      // Make another request to openweathermap.org
      ajax(
        {
          
          url: theFullURL,
          type:'json'
        },
        function(data) {
          // Create an array of Menu items
          

          
          console.log(JSON.stringify(data));
          var newItems = parseFeed(data, 6);
          
          // Update the Menu's first section
          resultsMenu.items(0, newItems);
          
          // Notify the user
          Vibe.vibrate('short');
        },
        function(error) {
          console.log('Download failed: ' + error);
        }
      );
    });
  },
  function(error) {
    console.log("Download failed: " + error);
  }
);

// Prepare the accelerometer
Accel.init();
   
}

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message); 
}

// Make an asynchronous request
navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
