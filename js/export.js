/**
 * SBMM Planning Tool - Export & Import
 *
 * CSV export, CSV import, and clipboard copy for planned points.
 */
var ExportModule = (function() {
    'use strict';

    /**
     * Export planned points as a CSV file download.
     */
    function exportCSV() {
        if (AppState.plannedPoints.length === 0) {
            alert('No points to export.');
            return;
        }

        var csv = 'Point_ID,Type,Depth,Latitude,Longitude,Note\n';
        AppState.plannedPoints.forEach(function(p) {
            csv += p.id + ',' + p.type + ',' + (p.depth || 'Shallow') + ',' +
                p.lat.toFixed(6) + ',' + p.lon.toFixed(6) + ',"' + (p.note || '') + '"\n';
        });

        var blob = new Blob([csv], { type: 'text/csv' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'SBMM_Planned_' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    /**
     * Copy planned points as text to clipboard.
     */
    function copyToClipboard() {
        if (AppState.plannedPoints.length === 0) {
            alert('No points to copy.');
            return;
        }

        var text = 'SBMM Round 2 Planned Locations\n';
        AppState.plannedPoints.forEach(function(p) {
            text += p.id + ' [' + (p.depth || 'Shallow') + ']: ' +
                p.lat.toFixed(6) + ', ' + p.lon.toFixed(6) +
                (p.note ? ' - ' + p.note : '') + '\n';
        });

        navigator.clipboard.writeText(text).then(function() {
            alert('Copied to clipboard!');
        });
    }

    /**
     * Load planned points from a CSV file.
     * @param {Event} event - File input change event
     */
    function loadCSV(event) {
        var file = event.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(e) {
            var text = e.target.result;
            var lines = text.split('\n');
            var loadedCount = 0;
            var skippedCount = 0;

            // Ask to clear existing points
            if (AppState.plannedPoints.length > 0) {
                if (confirm('Clear existing planned points before loading?\n\nClick OK to replace, Cancel to add to existing.')) {
                    AppState.layers.planned.clearLayers();
                    AppState.plannedPoints = [];
                }
            }

            // Parse CSV (skip header row)
            for (var i = 1; i < lines.length; i++) {
                var line = lines[i].trim();
                if (!line) continue;

                var parts = Utils.parseCSVLine(line);
                if (parts.length < 5) { skippedCount++; continue; }

                var pointId = parts[0];
                var type = parts[1].toLowerCase();
                var depth = parts[2] || 'Shallow';
                var lat = parseFloat(parts[3]);
                var lon = parseFloat(parts[4]);
                var note = parts[5] || '';

                // Validate coordinates
                if (isNaN(lat) || isNaN(lon)) { skippedCount++; continue; }

                // Skip duplicate IDs
                if (AppState.plannedPoints.find(function(p) { return p.id === pointId; })) {
                    skippedCount++;
                    continue;
                }

                // Validate type
                var color = AppConfig.pointTypes[type] ? AppConfig.pointTypes[type].color : AppConfig.colors.proposed;

                var point = {
                    id: pointId,
                    type: type,
                    lat: lat,
                    lon: lon,
                    depth: depth,
                    note: note,
                    color: color
                };

                AppState.plannedPoints.push(point);
                PlanningModule.addPlannedMarker(point);
                loadedCount++;
            }

            PlanningModule.updatePlannedPointsList();

            if (AppState.gapsVisible) AnalysisModule.createGapGrid();

            // Zoom to loaded points
            if (loadedCount > 0 && AppState.layers.planned.getLayers().length > 0) {
                AppState.map.fitBounds(AppState.layers.planned.getBounds(), { padding: [50, 50] });
            }

            var msg = 'Loaded ' + loadedCount + ' points';
            if (skippedCount > 0) msg += ' (' + skippedCount + ' skipped)';
            alert(msg);

            // Reset file input so same file can be loaded again
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    return {
        exportCSV: exportCSV,
        copyToClipboard: copyToClipboard,
        loadCSV: loadCSV
    };
})();
