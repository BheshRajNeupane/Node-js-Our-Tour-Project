const locations = JSON.parse(document.getElementById('map').dataset.locations);
//console.log(locations);




  mapboxgl.accessToken = "pk.eyJ1IjoiYmhlc2hyYWowNyIsImEiOiJjbGVzNHp0eWIwMmEzM3NzMHc4c2VxYXFuIn0.3kt4Hv7EGidpmOZG6kNC4g";

  var map = new mapboxgl.Map
  ({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',

    scrollZoom:false,
     center:[ -106.855385, 39.182677 ],
     zoom:9,
 // interactive:false
  });
const bounds = new mapboxgl.LngLatBounds()

  locations.forEach( loc => {
    // Create marker
    const el= document.createElement('div');
    el.className= 'marker';
    
    //Add marker
   new mapboxgl.Marker({
       element:el,
       anchor:'bottom'
   }).setLngLat(loc.coordinates)
    .addTo(map);

 //Add Popup
 new mapbox.Popup({offset:30})
     .setLngLat(loc.coordinates)
     .setHTML(`<p>${loc.day}:${loc.description} </p>`)
     .add
 


    //Extends map bounds to include current location
    bounds.extend(loc.coordinates)

})

map.fitBounds(bounds ,{
    padding:{
        top:200,
        bottom:150,
        left:100,
        right:100
    }
});