/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZGltbWl0YXJtaWxrb3YiLCJhIjoiY2xna3h4YzQ1MDBiaTNxcnk4aG1namU1bSJ9.75zXuYnpkh3eTrIEbN7Hsw';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/dimmitarmilkov/clgky1vyk008y01pchu4g4q58',
    scrollZoom: false
    //   center: [-118.19083624215881, 33.77325707178256],
    //   zoom: 3
    //   interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    //Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //Extends map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
