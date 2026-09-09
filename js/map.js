/**
 * map.js
 * ------------------------------------------------------------------
 * All Leaflet.js concerns live here: base map, watershed boundary,
 * intervention markers, selection highlighting, layer control.
 * ------------------------------------------------------------------
 */

const WSMap = (() => {

  let map = null;
  let boundaryLayer = null;
  let markerLayer = null;
  let markers = {}; // intervention_id -> L.Marker
  let onMarkerClick = null;

  function init(containerId, onClickCallback) {
    onMarkerClick = onClickCallback;

    map = L.map(containerId, {
      center: CONFIG.MAP_DEFAULT_CENTER,
      zoom: CONFIG.MAP_DEFAULT_ZOOM,
      minZoom: CONFIG.MAP_MIN_ZOOM,
      maxZoom: CONFIG.MAP_MAX_ZOOM,
      zoomControl: false
    });

    const streetLayer = L.tileLayer(CONFIG.MAP_TILE_URL, {
      attribution: CONFIG.MAP_TILE_ATTRIBUTION,
      maxZoom: CONFIG.MAP_MAX_ZOOM
    }).addTo(map);

    const satelliteLayer = L.tileLayer(CONFIG.MAP_SATELLITE_TILE_URL, {
      attribution: CONFIG.MAP_SATELLITE_ATTRIBUTION,
      maxZoom: CONFIG.MAP_MAX_ZOOM
    });

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.layers(
      { 'Street': streetLayer, 'Satellite': satelliteLayer },
      {},
      { position: 'topright', collapsed: true }
    ).addTo(map);

    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    markerLayer = L.layerGroup().addTo(map);

    // Fix Leaflet sizing issues when the container was hidden/resized
    setTimeout(() => map.invalidateSize(), 200);
    window.addEventListener('resize', () => map.invalidateSize());

    return map;
  }

  function setBoundary(geojsonGeometry, name) {
    if (boundaryLayer) {
      map.removeLayer(boundaryLayer);
      boundaryLayer = null;
    }
    if (!geojsonGeometry) return;

    boundaryLayer = L.geoJSON(geojsonGeometry, {
      style: {
        color: '#facc15',
        weight: 2,
        fillColor: '#facc15',
        fillOpacity: 0.06,
        dashArray: '6,4'
      }
    }).addTo(map);

    if (name) boundaryLayer.bindTooltip(name, { sticky: true, direction: 'top' });

    map.fitBounds(boundaryLayer.getBounds(), { padding: [30, 30] });
  }

  function markerIcon(type, selected) {
    const meta = CONFIG.INTERVENTION_TYPES[type] || CONFIG.INTERVENTION_TYPES.Other;
    const size = selected ? 26 : 18;
    const ring = selected ? `box-shadow:0 0 0 4px rgba(250,204,21,0.55);` : '';
    return L.divIcon({
      className: 'ws-marker',
      html: `<span style="
        display:block;width:${size}px;height:${size}px;border-radius:50%;
        background:${meta.color};border:2px solid #fff;${ring}
      "></span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  function setInterventions(interventions, selectedId = null) {
    markerLayer.clearLayers();
    markers = {};

    interventions.forEach(iv => {
      if (iv.latitude == null || iv.longitude == null) return;
      const marker = L.marker([iv.latitude, iv.longitude], {
        icon: markerIcon(iv.intervention_type, iv.intervention_id === selectedId)
      });
      marker.bindTooltip(`${iv.intervention_id} — ${iv.name}`, { direction: 'top', offset: [0, -10] });
      marker.on('click', () => onMarkerClick && onMarkerClick(iv.intervention_id));
      marker.addTo(markerLayer);
      markers[iv.intervention_id] = marker;
    });
  }

  function highlightSelected(interventionId, interventions) {
    // Re-render all markers so exactly one shows the selected style.
    setInterventions(interventions, interventionId);
    const m = markers[interventionId];
    if (m) {
      map.panTo(m.getLatLng());
      m.openTooltip();
    }
  }

  function invalidateSize() {
    if (map) map.invalidateSize();
  }

  return { init, setBoundary, setInterventions, highlightSelected, invalidateSize };
})();
