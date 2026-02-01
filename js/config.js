/**
 * SBMM Planning Tool - Configuration
 *
 * Central configuration for thresholds, map defaults, and constants.
 * To update cleanup levels or add new analytes, edit this file only.
 */
var AppConfig = (function() {
    'use strict';

    // 2023 ROD Table 2-3 (On-Mine Soils)
    // low = PMB (Pre-Mining Baseline), high = ROD Cleanup Level
    var thresholds = {
        Mercury:  { low: 35,  high: 204, unit: 'mg/kg', abbrev: 'Hg' },
        Arsenic:  { low: 6.1, high: 6.1, unit: 'mg/kg', abbrev: 'As' },
        Antimony: { low: 7.1, high: 51,  unit: 'mg/kg', abbrev: 'Sb' },
        Thallium: { low: 1.3, high: 1.3, unit: 'mg/kg', abbrev: 'Tl' }
    };

    // Full list of metals analyzed in 2025 samples (CAM-17)
    var allMetals = [
        'Aluminum', 'Antimony', 'Arsenic', 'Barium', 'Beryllium', 'Cadmium',
        'Calcium', 'Chromium', 'Cobalt', 'Copper', 'Iron', 'Lead', 'Magnesium',
        'Manganese', 'Mercury', 'Nickel', 'Potassium', 'Selenium', 'Silver',
        'Sodium', 'Thallium', 'Vanadium', 'Zinc'
    ];

    // Map defaults
    var mapDefaults = {
        zoom: 16,
        maxZoom: 22,
        tileUrls: {
            satellite: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            hybrid: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        },
        tileAttribution: '&copy; Google'
    };

    // Grid analysis defaults
    var gridDefaults = {
        sizeFt: 50,
        minSizeFt: 25,
        maxSizeFt: 100,
        stepFt: 25
    };

    // Coordinate conversion constants for ~39 deg N latitude
    // 1 deg lat ~ 111km, 1 deg lon ~ 86km at this latitude
    var coordConversion = {
        metersPerDegLat: 111000,
        metersPerDegLon: 86000,
        feetToMeters: 0.3048
    };

    // Marker styles
    var markerStyles = {
        sample2025: { radius: 9, weight: 2, opacity: 1, fillOpacity: 0.85 },
        soilBoring: { radius: 7, fillColor: '#0099cc', color: '#006699', weight: 2, opacity: 1, fillOpacity: 0.8 },
        planned: { iconSize: [14, 14] }
    };

    // Colors
    var colors = {
        high: '#d63e2a',
        medium: '#f0932b',
        low: '#72af26',
        notSampled: '#808080',
        proposed: '#00bfff',
        stepout: '#ff6b00',
        eaTestPit: '#9c27b0',
        testPit2025: '#cc6600',
        soilBoring: '#0099cc',
        header: '#1F4E79',
        eaHeader: '#8B4513'
    };

    // Point type configuration
    var pointTypes = {
        proposed: { prefix: 'P-', color: '#00bfff', label: 'Proposed' },
        stepout: { prefix: 'SO-', color: '#ff6b00', label: 'Step-out' }
    };

    // Depth options
    var depthOptions = ['Shallow', 'Deep', 'Both'];

    // Data file paths (relative to project root)
    var dataFiles = {
        samples2025: 'data/samples-2025.json',
        eaSamples: 'data/ea-samples.json',
        eaTestPits: 'data/ea-test-pits.json',
        testPits2025: 'data/test-pits-2025.json',
        soilBorings2025: 'data/soil-borings-2025.json'
    };

    // Public API
    return {
        thresholds: thresholds,
        allMetals: allMetals,
        mapDefaults: mapDefaults,
        gridDefaults: gridDefaults,
        coordConversion: coordConversion,
        markerStyles: markerStyles,
        colors: colors,
        pointTypes: pointTypes,
        depthOptions: depthOptions,
        dataFiles: dataFiles,

        /**
         * Get color for a concentration value against an analyte's thresholds.
         * @param {number|null} value - The concentration value
         * @param {string} analyte - Analyte name (e.g., 'Mercury')
         * @returns {string} Hex color code
         */
        getColorForValue: function(value, analyte) {
            if (value === null || value === undefined) return colors.notSampled;
            var thresh = thresholds[analyte];
            if (!thresh) return colors.notSampled;
            if (value > thresh.high) return colors.high;
            if (value > thresh.low) return colors.medium;
            return colors.low;
        },

        /**
         * Check if a value exceeds the ROD cleanup level for an analyte.
         * @param {number|null} value
         * @param {string} analyte
         * @returns {boolean}
         */
        exceedsROD: function(value, analyte) {
            if (value === null || value === undefined) return false;
            var thresh = thresholds[analyte];
            return thresh && value > thresh.high;
        },

        /**
         * Get the analyte abbreviation map.
         * @returns {Object}
         */
        getAnalyteAbbreviations: function() {
            var abbrevs = {};
            Object.keys(thresholds).forEach(function(key) {
                abbrevs[key] = thresholds[key].abbrev;
            });
            return abbrevs;
        }
    };
})();
