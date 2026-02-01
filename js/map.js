/**
 * SBMM Planning Tool - Map Setup
 *
 * Initializes the Leaflet map, tile layers, and layer groups.
 */
var MapModule = (function() {
    'use strict';

    /**
     * Initialize the map centered on all sample locations.
     */
    function init() {
        var data = AppState.data;
        var config = AppConfig.mapDefaults;

        // Calculate center from all sample points
        var allLats = data.samples2025.map(function(s) { return s.lat; })
            .concat(data.eaSamples.map(function(e) { return e.lat; }));
        var allLons = data.samples2025.map(function(s) { return s.lon; })
            .concat(data.eaSamples.map(function(e) { return e.lon; }));

        var centerLat = allLats.reduce(function(a, b) { return a + b; }, 0) / allLats.length;
        var centerLon = allLons.reduce(function(a, b) { return a + b; }, 0) / allLons.length;

        // Create map
        AppState.map = L.map('map').setView([centerLat, centerLon], config.zoom);

        // Add tile layers
        var googleSat = L.tileLayer(config.tileUrls.satellite, {
            attribution: config.tileAttribution,
            maxZoom: config.maxZoom
        }).addTo(AppState.map);

        var googleHybrid = L.tileLayer(config.tileUrls.hybrid, {
            attribution: config.tileAttribution,
            maxZoom: config.maxZoom
        });

        L.control.layers({ 'Satellite': googleSat, 'Hybrid': googleHybrid }).addTo(AppState.map);

        // Initialize layer groups
        var layers = AppState.layers;
        layers.sampled2025 = L.layerGroup();
        layers.notSampled2025 = L.layerGroup();
        layers.eaSamples = L.layerGroup();
        layers.eaTestPits = L.layerGroup();
        layers.planned = L.layerGroup();
        layers.testPits2025 = L.layerGroup();
        layers.soilBorings2025 = L.layerGroup();

        // Label layer
        AppState.labelLayer = L.layerGroup();

        // Scale control
        L.control.scale({ imperial: true, metric: true }).addTo(AppState.map);

        // Map events
        AppState.map.on('mousemove', function(e) {
            var coordEl = document.getElementById('cursorCoords');
            if (coordEl) {
                coordEl.textContent = 'Lat: ' + e.latlng.lat.toFixed(6) + ', Lon: ' + e.latlng.lng.toFixed(6);
            }
        });

        AppState.map.on('click', handleMapClick);
    }

    /**
     * Handle map clicks for measurement and point planning.
     */
    function handleMapClick(e) {
        // Measurement mode takes priority
        if (AppState.measureMode) {
            AnalysisModule.handleMeasureClick(e.latlng);
            return;
        }

        // In view mode, do nothing
        if (AppState.currentMode === 'view') return;

        // In planning mode, show the add-point popup
        PlanningModule.showAddPointPopup(e.latlng);
    }

    return {
        init: init
    };
})();
