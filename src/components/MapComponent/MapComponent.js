import React from "react"
import mapboxgl from "mapbox-gl"
//import { MapboxLayer } from '@deck.gl/mapbox'
//import {ScatterplotLayer} from '@deck.gl/layers';


mapboxgl.accessToken =
'pk.eyJ1Ijoic2NvdHRwZXoiLCJhIjoiY2tjNHYzMWlmMDk0dzJ0cXBlYmY3ZGFkMSJ9.3sV7qx5UKfvCQPFXXTGFBw';


class MapComponent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lng: -97,
      lat: 38,
      zoom: 4
    };
    this.mapContainer = React.createRef();
    // mapbox layer

  }

  componentDidMount() {
    var map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v11",
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom
    });


    this.setState({
      lng: map.getCenter().lng.toFixed(4),
      lat: map.getCenter().lat.toFixed(4),
      zoom: map.getZoom().toFixed(2)
    });

    map.on("move", () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)})
      });

    map.on("load", () => {
      map.addSource('all_parks', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/ztoms/Park-Visitations-Dashboard/main/src/data/visitor_counts.geojson'
        });

      // add layer of parks with percent-change data
      map.addLayer({
        id: 'poi-locations',
        type: 'circle',
        source: 'all_parks',
        filter: ['has', 'percent_change'],
        minzoom: 8,
        paint: {
          'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'visitor_counts_pre2020'],
              1,
              3,
              10,
              6,
              100,
              12,
              1000,
              24,
              10000,
              32
            ],
          'circle-blur': 0.4,
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'percent_change'],
            -1,
            'rgba(225,19,19,0.8)',
            0,
            'rgba(225,225,19,0.5)',
            1,
            'rgba(19,225,19,0.8)'
            ]
        },
      });

      // add layer of parks with percent-change data
      map.addLayer({
        id: 'poi-locations-no-data',
        type: 'circle',
        source: 'all_parks',
        filter: ['!', ['has', 'percent_change']],
        minzoom: 8,
        paint: {
          'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'visitor_counts_pre2020'],
              1,
              3,
              10,
              6,
              100,
              12,
              1000,
              24,
              10000,
              32
            ],
          'circle-blur': 0.1,
          'circle-color': 'rgba(162,162,162,0.4)'
        },
      });

      map.addLayer({
        'id': 'poi-labels',
        'type': 'symbol',
        'source': 'all_parks',
        'minzoom': 10,
        'layout': {
          'text-field': ['get', 'location_name'],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.8,
          "text-size": {
              "stops": [
                  [0, 0],
                  [3, 0],
                  [4, 0],
                  [5, 0],
                  [6, 0],
                  [7, 0],
                  [8, 0],
                  [10, 6],
                  [12, 12],
              ]
          }
        }
      });

    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map.on('mouseenter', 'poi-locations', function (e) {
      map.getCanvas().style.cursor = 'pointer';

      var coordinates = e.features[0].geometry.coordinates.slice();
      var name = e.features[0].properties.location_name;
      var city = e.features[0].properties.city;
      var state = e.features[0].properties.region;
      var pre2020 = e.features[0].properties.visitor_counts_pre2020;
      var post2020 = e.features[0].properties.visitor_counts_post2020;
      var change = e.features[0].properties.percent_change;

      // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      
      pre2020 = pre2020 ? pre2020 : "no data"
      post2020 = post2020 ? post2020 : "no data"
      change = change ? change : "no data"

      // Populate the popup and set its coordinates based on the feature found.
      popup.setLngLat(coordinates).setHTML(`<b>${name}</b>, ${city}, ${state} <p> <b>Average Monthly Visitors</b> <br> Pre-2020: ${pre2020} <br>
                                            Post-2020: ${post2020} <br></p> <b>Percent change:</b> ${change}`).addTo(map);
    });

    map.on('mouseleave', 'poi-locations', function () {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });

  }





  render() {
    const { lng, lat, zoom } = this.state;
    return (
      <div>
        <div className="sidebar">
            Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <div
          ref={this.mapContainer}
          className="map-container"
          style={{
            height: "100vh"
          }}>
        </div>
      </div>

    );
  }
}


export default (MapComponent)
