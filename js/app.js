/**
 * SBMM Planning Tool - Application Entry Point
 *
 * Loads data from JSON files, initializes all modules, and wires up event listeners.
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var files = AppConfig.dataFiles;

        // Load all data files in parallel
        Promise.all([
            Utils.loadJSON(files.samples2025),
            Utils.loadJSON(files.eaSamples),
            Utils.loadJSON(files.eaTestPits),
            Utils.loadJSON(files.testPits2025),
            Utils.loadJSON(files.soilBorings2025)
        ]).then(function(results) {
            // Store loaded data in state
            AppState.data.samples2025 = results[0];
            AppState.data.eaSamples = results[1];
            AppState.data.eaTestPits = results[2];
            AppState.data.testPits2025 = results[3];
            AppState.data.soilBorings2025 = results[4];

            // Initialize modules
            MapModule.init();
            MarkersModule.init();
            buildSampleLists();
            bindEventListeners();

        }).catch(function(error) {
            console.error('Failed to load data:', error);
            document.getElementById('map').innerHTML =
                '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1a1a1a;color:#ff4444;font-family:Arial;font-size:16px;padding:40px;text-align:center;">' +
                '<div><h2>Data Load Error</h2><p style="color:#aaa;margin-top:10px;">Could not load sampling data files.<br>Ensure the data/ directory contains valid JSON files.<br><br>' +
                '<small style="color:#666;">Error: ' + error.message + '</small></p>' +
                '<p style="color:#888;margin-top:20px;font-size:12px;">Note: This app requires an HTTP server. Use:<br>' +
                '<code style="color:#0af;">python -m http.server 8000</code><br>then open <code style="color:#0af;">http://localhost:8000</code></p></div></div>';
        });
    });

    /**
     * Build the sidebar sample lists from loaded data.
     */
    function buildSampleLists() {
        var data = AppState.data;

        // Build 2025 sample list (sorted by mercury, highest first)
        var sorted2025 = data.samples2025.slice().sort(function(a, b) {
            if (!a.sampled) return 1;
            if (!b.sampled) return -1;
            return ((b.metals && b.metals.Mercury) || 0) - ((a.metals && a.metals.Mercury) || 0);
        });

        var list2025Html = '';
        sorted2025.forEach(function(s) {
            var hgText = s.metals && s.metals.Mercury !== null ? Utils.fmt(s.metals.Mercury) : '\u2014';
            var asText = s.metals && s.metals.Arsenic !== null ? Utils.fmt(s.metals.Arsenic) : '\u2014';
            var sbText = s.metals && s.metals.Antimony !== null ? Utils.fmt(s.metals.Antimony) : '\u2014';
            var hgFlag = s.metals && s.metals.Mercury && s.metals.Mercury > 204 ? '<span class="flag">\u26a0</span>' : '';
            var asFlag = s.metals && s.metals.Arsenic && s.metals.Arsenic > 6.1 ? '<span class="flag">\u26a0</span>' : '';
            var sbFlag = s.metals && s.metals.Antimony && s.metals.Antimony > 51 ? '<span class="flag">\u26a0</span>' : '';

            list2025Html += '<div class="sample-item" style="border-color: ' + s.color + ';" data-type="2025" data-id="' + s.num + '">' +
                '<span class="name">' + s.label + '</span>' +
                '<span class="hg">Hg:' + hgText + hgFlag + '</span>' +
                '<span class="as">As:' + asText + asFlag + '</span>' +
                '<span class="sb">Sb:' + sbText + sbFlag + '</span></div>';
        });
        document.getElementById('sampleList2025').innerHTML = list2025Html;

        // Build EA sample list
        var sortedEA = data.eaSamples.slice().sort(function(a, b) {
            return (b.mercury || 0) - (a.mercury || 0);
        });

        var listEAHtml = '';
        sortedEA.forEach(function(e) {
            var hgFlag = e.mercury && e.mercury > 204 ? '<span class="flag">\u26a0</span>' : '';
            var asFlag = e.arsenic && e.arsenic > 6.1 ? '<span class="flag">\u26a0</span>' : '';
            var sbFlag = e.antimony && e.antimony > 51 ? '<span class="flag">\u26a0</span>' : '';

            listEAHtml += '<div class="sample-item" style="border-color: ' + e.color + ';" data-type="EA" data-id="' + e.id + '">' +
                '<span class="name">' + e.id + '</span>' +
                '<span class="hg">Hg:' + Utils.fmt(e.mercury) + hgFlag + '</span>' +
                '<span class="as">As:' + Utils.fmt(e.arsenic) + asFlag + '</span>' +
                '<span class="sb">Sb:' + Utils.fmt(e.antimony) + sbFlag + '</span></div>';
        });
        document.getElementById('sampleListEA').innerHTML = listEAHtml;

        // Click handlers for sample list items
        document.querySelectorAll('.sample-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var type = this.getAttribute('data-type');
                var id = this.getAttribute('data-id');
                var marker;
                if (type === '2025') {
                    marker = AppState.markers2025[parseInt(id)];
                } else {
                    marker = AppState.markersEA[id];
                }
                if (marker) {
                    AppState.map.setView(marker.getLatLng(), 19);
                    marker.openPopup();
                }
            });
        });
    }

    /**
     * Bind all UI event listeners.
     */
    function bindEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
                document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
                this.classList.add('active');
                document.getElementById(this.getAttribute('data-tab')).classList.add('active');
            });
        });

        // Mode buttons
        document.getElementById('btn-view').addEventListener('click', function() { PlanningModule.setMode('view'); });
        document.getElementById('btn-proposed').addEventListener('click', function() { PlanningModule.setMode('proposed'); });
        document.getElementById('btn-stepout').addEventListener('click', function() { PlanningModule.setMode('stepout'); });

        // Action buttons
        document.getElementById('btn-undo').addEventListener('click', PlanningModule.undoLast);
        document.getElementById('btn-clear').addEventListener('click', PlanningModule.clearAllPlanned);
        document.getElementById('btn-export').addEventListener('click', ExportModule.exportCSV);
        document.getElementById('btn-copy').addEventListener('click', ExportModule.copyToClipboard);
        document.getElementById('csv-upload').addEventListener('change', ExportModule.loadCSV);

        // Analysis tools
        document.getElementById('btn-measure').addEventListener('click', AnalysisModule.toggleMeasureMode);
        document.getElementById('btn-gaps').addEventListener('click', AnalysisModule.toggleGapAnalysis);
        document.getElementById('btn-hotzone').addEventListener('click', AnalysisModule.toggleHotZones);
        document.getElementById('btn-grid-down').addEventListener('click', function() { AnalysisModule.adjustGridSize(-25); });
        document.getElementById('btn-grid-up').addEventListener('click', function() { AnalysisModule.adjustGridSize(25); });
        document.getElementById('btn-include-planned').addEventListener('click', AnalysisModule.toggleIncludePlanned);

        // Color-by analyte selector
        document.getElementById('colorBySelect').addEventListener('change', function() {
            AppState.currentAnalyte = this.value;
            MarkersModule.updateMarkerColors();
            if (AppState.hotzoneVisible) {
                AnalysisModule.createHotZoneGrid();
                AnalysisModule.updateHotZoneLegend();
            }
        });

        // Layer toggles
        bindLayerToggle('toggle2025Sampled', 'sampled2025');
        bindLayerToggle('toggle2025NotSampled', 'notSampled2025');
        bindLayerToggle('toggleEASamples', 'eaSamples');
        bindLayerToggle('toggleEATestPits', 'eaTestPits');
        bindLayerToggle('togglePlanned', 'planned');
        bindLayerToggle('toggleTestPits2025', 'testPits2025');
        bindLayerToggle('toggleSoilBorings2025', 'soilBorings2025');

        // Label toggle
        document.getElementById('toggleLabels').addEventListener('change', function() {
            AppState.labelsVisible = this.checked;
            if (AppState.labelsVisible) {
                MarkersModule.updateLabels();
                AppState.map.addLayer(AppState.labelLayer);
            } else {
                AppState.map.removeLayer(AppState.labelLayer);
            }
        });

        // Refresh labels when layer visibility changes
        var labelRefreshToggles = [
            'toggle2025Sampled', 'toggle2025NotSampled', 'toggleEASamples',
            'toggleEATestPits', 'togglePlanned', 'toggleTestPits2025', 'toggleSoilBorings2025'
        ];
        labelRefreshToggles.forEach(function(id) {
            document.getElementById(id).addEventListener('change', function() {
                if (AppState.labelsVisible) MarkersModule.updateLabels();
            });
        });
    }

    /**
     * Bind a checkbox to toggle a layer group on/off.
     * @param {string} checkboxId - DOM ID of the checkbox
     * @param {string} layerKey - Key in AppState.layers
     */
    function bindLayerToggle(checkboxId, layerKey) {
        document.getElementById(checkboxId).addEventListener('change', function() {
            if (this.checked) {
                AppState.map.addLayer(AppState.layers[layerKey]);
            } else {
                AppState.map.removeLayer(AppState.layers[layerKey]);
            }
        });
    }
})();
