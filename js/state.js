/**
 * SBMM Planning Tool - Application State
 *
 * Centralized state management. All mutable application state lives here.
 * Modules read and write state through this object instead of globals.
 */
var AppState = (function() {
    'use strict';

    var state = {
        // Leaflet map instance
        map: null,

        // Layer groups (Leaflet LayerGroups)
        layers: {
            sampled2025: null,
            notSampled2025: null,
            eaSamples: null,
            eaTestPits: null,
            planned: null,
            testPits2025: null,
            soilBorings2025: null
        },

        // Marker lookup tables (keyed by sample ID)
        markers2025: {},
        markersEA: {},

        // Loaded data arrays (populated from JSON files)
        data: {
            samples2025: [],
            eaSamples: [],
            eaTestPits: [],
            testPits2025: [],
            soilBorings2025: []
        },

        // Planning mode: 'view' | 'proposed' | 'stepout'
        currentMode: 'view',

        // User-created planned sampling points
        plannedPoints: [],

        // Pending point (during add confirmation popup)
        pendingPoint: null,

        // Analysis tools
        measureMode: false,
        measurePoints: [],
        measureMarkers: [],
        measureLine: null,
        gapLayer: null,
        gapsVisible: false,
        hotzoneLayer: null,
        hotzoneVisible: false,
        gridSizeFt: AppConfig.gridDefaults.sizeFt,
        includePlannedInGaps: true,

        // Current analyte for color-by and hot zone analysis
        currentAnalyte: 'Mercury',

        // Label layer
        labelLayer: null,
        labelsVisible: false,

        // Popup state tracking (for "Show All Metals" toggles)
        ssShowAllMetals: {},
        tpShowAllMetals: {}
    };

    return state;
})();
