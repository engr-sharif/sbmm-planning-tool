/**
 * SBMM Planning Tool - Marker Creation & Popups
 *
 * Creates map markers for all data types and builds popup content.
 */
var MarkersModule = (function() {
    'use strict';

    /**
     * Initialize all markers from loaded data.
     */
    function init() {
        createSample2025Markers();
        createEASampleMarkers();
        createEATestPitMarkers();
        createTestPit2025Markers();
        createSoilBoringMarkers();
    }

    // ===== 2025 SURFACE SAMPLES =====

    function createSurfaceSamplePopup(s) {
        var hg = s.metals ? s.metals.Mercury : null;
        var arsenic = s.metals ? s.metals.Arsenic : null;
        var antimony = s.metals ? s.metals.Antimony : null;
        var thallium = s.metals ? s.metals.Thallium : null;

        if (!s.sampled || !s.metals) {
            return '<div style="font-family: Arial; min-width: 200px;">' +
                '<h4 style="margin: 0 0 6px 0; color: ' + AppConfig.colors.header + ';">Surface Sample: ' + s.label + '</h4>' +
                '<div style="font-size:10px;color:#666;margin-bottom:6px;">Depth: 0-6 inches</div>' +
                '<div style="background:#f5f5f5;padding:8px;border-radius:4px;text-align:center;">' +
                '<i style="color:#888;">Not yet sampled</i></div>' +
                '<div style="margin-top:6px;font-size:9px;color:#666;">' +
                '<b>Priority:</b> ' + s.priority + '<br>' +
                '<small>' + s.lat.toFixed(6) + ', ' + s.lon.toFixed(6) + '</small></div></div>';
        }

        var hgExceed = AppConfig.exceedsROD(hg, 'Mercury');
        var asExceed = AppConfig.exceedsROD(arsenic, 'Arsenic');
        var sbExceed = AppConfig.exceedsROD(antimony, 'Antimony');
        var tlExceed = AppConfig.exceedsROD(thallium, 'Thallium');
        var anyExceed = hgExceed || asExceed || sbExceed || tlExceed;
        var exceedCount = [hgExceed, asExceed, sbExceed, tlExceed].filter(Boolean).length;

        var statusColor = anyExceed ? AppConfig.colors.high : AppConfig.colors.low;
        var statusText = anyExceed ? exceedCount + ' Exceedance' + (exceedCount > 1 ? 's' : '') : 'Below ROD';
        var statusBar = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:6px 8px;background:' + (anyExceed ? '#fff0f0' : '#f0fff0') + ';border-left:4px solid ' + statusColor + ';border-radius:0 4px 4px 0;">' +
            '<div style="width:12px;height:12px;border-radius:50%;background:' + statusColor + ';"></div>' +
            '<span style="font-size:10px;font-weight:bold;color:' + statusColor + ';">' + statusText + '</span></div>';

        var fv = Utils.formatVal;
        var thresholds = AppConfig.thresholds;
        var cocTable = '<table style="width:100%;font-size:10px;border-collapse:collapse;">' +
            '<tr style="background:#f0f8ff;"><th style="text-align:left;padding:4px;">COC</th><th style="padding:4px;text-align:center;">Result</th><th style="padding:4px;text-align:center;">ROD</th><th style="padding:4px;text-align:center;">Status</th></tr>' +
            '<tr><td style="padding:4px;">Mercury</td><td style="padding:4px;text-align:center;' + (hgExceed ? 'color:#d63e2a;font-weight:bold;' : '') + '">' + fv(hg) + '</td><td style="padding:4px;text-align:center;color:#666;">' + thresholds.Mercury.high + '</td><td style="padding:4px;text-align:center;">' + (hgExceed ? '\u26a0\ufe0f' : '\u2713') + '</td></tr>' +
            '<tr style="background:#fafafa;"><td style="padding:4px;">Arsenic</td><td style="padding:4px;text-align:center;' + (asExceed ? 'color:#d63e2a;font-weight:bold;' : '') + '">' + fv(arsenic) + '</td><td style="padding:4px;text-align:center;color:#666;">' + thresholds.Arsenic.high + '</td><td style="padding:4px;text-align:center;">' + (asExceed ? '\u26a0\ufe0f' : '\u2713') + '</td></tr>' +
            '<tr><td style="padding:4px;">Antimony</td><td style="padding:4px;text-align:center;' + (sbExceed ? 'color:#d63e2a;font-weight:bold;' : '') + '">' + fv(antimony) + '</td><td style="padding:4px;text-align:center;color:#666;">' + thresholds.Antimony.high + '</td><td style="padding:4px;text-align:center;">' + (sbExceed ? '\u26a0\ufe0f' : '\u2713') + '</td></tr>' +
            '<tr style="background:#fafafa;"><td style="padding:4px;">Thallium</td><td style="padding:4px;text-align:center;' + (tlExceed ? 'color:#d63e2a;font-weight:bold;' : '') + '">' + fv(thallium) + '</td><td style="padding:4px;text-align:center;color:#666;">' + thresholds.Thallium.high + '</td><td style="padding:4px;text-align:center;">' + (tlExceed ? '\u26a0\ufe0f' : '\u2713') + '</td></tr>' +
            '</table>';

        var fullMetalsHtml = '<div class="ss-full-metals" id="ss-fullmetals-' + s.label + '" style="display:none;margin-top:8px;max-height:150px;overflow-y:auto;font-size:9px;border:1px solid #ddd;border-radius:4px;">';
        fullMetalsHtml += '<table style="width:100%;border-collapse:collapse;">';
        AppConfig.allMetals.forEach(function(m, idx) {
            var val = s.metals[m];
            var valText = val !== null && val !== undefined ? fv(val) : '\u2014';
            var bg = idx % 2 === 0 ? '#fff' : '#f9f9f9';
            fullMetalsHtml += '<tr style="background:' + bg + ';"><td style="padding:3px 6px;">' + m + '</td><td style="padding:3px 6px;text-align:right;">' + valText + '</td></tr>';
        });
        fullMetalsHtml += '</table></div>';

        return '<div style="font-family: Arial; min-width: 240px;" id="ss-popup-' + s.label + '">' +
            '<h4 style="margin: 0 0 4px 0; color: ' + AppConfig.colors.header + ';">Surface Sample: ' + s.label + '</h4>' +
            '<div style="font-size:10px;color:#666;margin-bottom:6px;"><b>Depth:</b> 0-6 in | <b>Priority:</b> ' + s.priority + '</div>' +
            statusBar + cocTable +
            '<button class="ss-toggle-metals-btn" onclick="MarkersModule.toggleSSFullMetals(\'' + s.label + '\', this)" style="margin-top:8px;font-size:9px;padding:3px 8px;cursor:pointer;border:1px solid #ccc;border-radius:3px;background:#f5f5f5;">Show All Metals \u25bc</button>' +
            fullMetalsHtml +
            '<div style="margin-top:8px;font-size:8px;color:#888;">' + s.lat.toFixed(6) + ', ' + s.lon.toFixed(6) + ' | Units: mg/kg</div></div>';
    }

    function createSample2025Markers() {
        var data = AppState.data.samples2025;
        var style = AppConfig.markerStyles.sample2025;

        data.forEach(function(s) {
            var marker = L.circleMarker([s.lat, s.lon], {
                radius: style.radius,
                fillColor: s.color,
                color: '#000',
                weight: style.weight,
                opacity: style.opacity,
                fillOpacity: style.fillOpacity
            });

            marker.bindPopup(createSurfaceSamplePopup(s), { maxWidth: 300 });
            marker.bindTooltip('2025: ' + s.label, { direction: 'top', offset: [0, -8] });
            marker.sampleNum = s.num;

            if (s.sampled) {
                marker.addTo(AppState.layers.sampled2025);
            } else {
                marker.addTo(AppState.layers.notSampled2025);
            }
            AppState.markers2025[s.num] = marker;
        });
    }

    // ===== EA HISTORICAL SAMPLES =====

    function createEASamplePopup(e) {
        var hgExceed = AppConfig.exceedsROD(e.mercury, 'Mercury');
        var asExceed = AppConfig.exceedsROD(e.arsenic, 'Arsenic');
        var sbExceed = AppConfig.exceedsROD(e.antimony, 'Antimony');
        var tlExceed = AppConfig.exceedsROD(e.thallium, 'Thallium');
        var anyExceed = hgExceed || asExceed || sbExceed || tlExceed;
        var exceedCount = [hgExceed, asExceed, sbExceed, tlExceed].filter(Boolean).length;

        var fv = Utils.formatVal;
        var thresholds = AppConfig.thresholds;
        var statusColor = anyExceed ? AppConfig.colors.high : AppConfig.colors.low;
        var statusText = anyExceed ? exceedCount + ' Exceedance' + (exceedCount > 1 ? 's' : '') : 'Below ROD';

        var statusBar = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:6px 8px;background:' + (anyExceed ? '#fff0f0' : '#f0fff0') + ';border-left:4px solid ' + statusColor + ';border-radius:0 4px 4px 0;">' +
            '<div style="width:12px;height:12px;border-radius:50%;background:' + statusColor + ';"></div>' +
            '<span style="font-size:10px;font-weight:bold;color:' + statusColor + ';">' + statusText + '</span></div>';

        var cocTable = '<table style="width:100%;font-size:10px;border-collapse:collapse;">' +
            '<tr style="background:#f5ebe0;"><th style="text-align:left;padding:4px;">COC</th><th style="padding:4px;text-align:center;">Result</th><th style="padding:4px;text-align:center;">ROD</th><th style="padding:4px;text-align:center;">Status</th></tr>' +
            '<tr><td style="padding:4px;">Mercury</td><td style="padding:4px;text-align:center;' + (hgExceed ? 'color:#d63e2a;font-weight:bold;' : '') + '">' + fv(e.mercury) + '</td><td style="padding:4px;text-align:center;color:#666;">' + thresholds.Mercury.high + '</td><td style="padding:4px;text-align:center;">' + (hgExceed ? '\u26a0\ufe0f' : '\u2713') + '</td></tr>' +
            '<tr style="background:#faf6f0;"><td style="padding:4px;">Arsenic</td><td style="padding:4px;text-align:center;' + (asExceed ? 'color:#d63e2a;font-weight:bold;' : '') + '">' + fv(e.arsenic) + '</td><td style="padding:4px;text-align:center;color:#666;">' + thresholds.Arsenic.high + '</td><td style="padding:4px;text-align:center;">' + (asExceed ? '\u26a0\ufe0f' : '\u2713') + '</td></tr>' +
            '<tr><td style="padding:4px;">Antimony</td><td style="padding:4px;text-align:center;' + (sbExceed ? 'color:#d63e2a;font-weight:bold;' : '') + '">' + fv(e.antimony) + '</td><td style="padding:4px;text-align:center;color:#666;">' + thresholds.Antimony.high + '</td><td style="padding:4px;text-align:center;">' + (sbExceed ? '\u26a0\ufe0f' : '\u2713') + '</td></tr>' +
            '<tr style="background:#faf6f0;"><td style="padding:4px;">Thallium</td><td style="padding:4px;text-align:center;' + (tlExceed ? 'color:#d63e2a;font-weight:bold;' : '') + '">' + fv(e.thallium) + '</td><td style="padding:4px;text-align:center;color:#666;">' + thresholds.Thallium.high + '</td><td style="padding:4px;text-align:center;">' + (tlExceed ? '\u26a0\ufe0f' : '\u2713') + '</td></tr>' +
            '</table>';

        return '<div style="font-family: Arial; min-width: 240px;">' +
            '<h4 style="margin: 0 0 4px 0; color: ' + AppConfig.colors.eaHeader + ';">EA Sample: ' + e.id + '</h4>' +
            '<div style="font-size:10px;color:#666;margin-bottom:6px;"><b>Priority:</b> ' + e.priority + ' | <b>Historical Data</b></div>' +
            statusBar + cocTable +
            '<div style="margin-top:8px;font-size:8px;color:#888;">' + e.lat.toFixed(6) + ', ' + e.lon.toFixed(6) + ' | Units: mg/kg</div></div>';
    }

    function createEASampleMarkers() {
        AppState.data.eaSamples.forEach(function(e) {
            var triangleHtml = '<div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:14px solid ' + e.color + ';filter:drop-shadow(1px 1px 1px rgba(0,0,0,0.5));"></div>';

            var marker = L.marker([e.lat, e.lon], {
                icon: L.divIcon({
                    className: 'ea-triangle',
                    html: triangleHtml,
                    iconSize: [16, 14],
                    iconAnchor: [8, 14]
                })
            });

            marker.bindPopup(createEASamplePopup(e), { maxWidth: 280 });
            marker.bindTooltip('EA: ' + e.id + ' Hg=' + Utils.fmt(e.mercury), { direction: 'top', offset: [0, -12] });
            marker.sampleId = e.id;
            marker.addTo(AppState.layers.eaSamples);
            AppState.markersEA[e.id] = marker;
        });
    }

    // ===== EA TEST PITS =====

    function createEATestPitMarkers() {
        AppState.data.eaTestPits.forEach(function(tp) {
            var marker = L.marker([tp.lat, tp.lon], {
                icon: L.divIcon({
                    className: 'testpit-icon',
                    html: '<div style="background: #9c27b0; width: 12px; height: 12px; border: 2px solid #000; transform: rotate(45deg);"></div>',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                })
            });
            marker.bindPopup(
                '<div style="font-family: Arial; min-width: 200px;">' +
                '<h4 style="margin: 0 0 6px 0; color: #9932CC;">EA Test Pit: ' + tp.id + '</h4>' +
                '<div style="font-size:10px;color:#666;margin-bottom:6px;">' +
                '<b>pH:</b> ' + tp.ph + '<br><b>Coord:</b> ' + tp.lat.toFixed(6) + ', ' + tp.lon.toFixed(6) + '</div>' +
                '<div style="font-size:10px;background:#f5f0f8;padding:6px;border-radius:4px;">' + tp.notes + '</div></div>'
            );
            marker.addTo(AppState.layers.eaTestPits);
        });
    }

    // ===== 2025 TEST PITS =====

    function createTestPitPopup(tp) {
        var elevText = tp.elev ? tp.elev.toFixed(1) + ' ft' : 'N/A';
        var hasData = tp.depths && tp.depths.length > 0;

        if (!hasData) {
            return '<div style="font-family: Arial;">' +
                '<h4 style="margin: 0 0 6px 0; color: #cc6600;">Test Pit: ' + tp.id + '</h4>' +
                '<div style="font-size:10px;color:#666;margin-bottom:6px;">' +
                '<b>Elev:</b> ' + elevText + '<br><b>Coord:</b> ' + tp.lat.toFixed(6) + ', ' + tp.lon.toFixed(6) + '</div>' +
                '<i style="color:#888;">No lab data available</i></div>';
        }

        var maxDepth = Math.max.apply(null, tp.depths.map(function(d) { return d.end; }));
        var profileHeight = Math.min(180, Math.max(100, maxDepth * 4));
        var thresholds = AppConfig.thresholds;

        // Vertical depth profile
        var verticalProfile = '<div class="tp-vertical-profile" id="tp-profile-' + tp.id + '" style="position:relative;width:35px;height:' + profileHeight + 'px;background:#f5f5f5;border:2px solid #333;border-radius:3px;flex-shrink:0;">';
        var markerInterval = maxDepth <= 10 ? 2 : (maxDepth <= 20 ? 5 : 10);
        for (var depth = 0; depth <= maxDepth; depth += markerInterval) {
            var topPct = (depth / maxDepth) * 100;
            verticalProfile += '<div style="position:absolute;right:-24px;top:' + topPct + '%;transform:translateY(-50%);font-size:8px;color:#666;">' + depth + '\'</div>';
            verticalProfile += '<div style="position:absolute;right:0;top:' + topPct + '%;width:4px;height:1px;background:#999;"></div>';
        }

        tp.depths.forEach(function(d, i) {
            var topPct = (d.start / maxDepth) * 100;
            var heightPct = ((d.end - d.start) / maxDepth) * 100;
            var hasExceed = d.metals && (
                AppConfig.exceedsROD(d.metals.Mercury, 'Mercury') ||
                AppConfig.exceedsROD(d.metals.Arsenic, 'Arsenic') ||
                AppConfig.exceedsROD(d.metals.Antimony, 'Antimony') ||
                AppConfig.exceedsROD(d.metals.Thallium, 'Thallium')
            );
            var color = hasExceed ? AppConfig.colors.high : AppConfig.colors.low;
            verticalProfile += '<div class="tp-depth-segment" data-idx="' + i + '" style="position:absolute;left:4px;right:4px;top:' + topPct + '%;height:' + heightPct + '%;background:' + color + ';border:1px solid rgba(0,0,0,0.2);cursor:pointer;transition:all 0.2s;" onclick="MarkersModule.showTPDepth(\'' + tp.id + '\',' + i + ')" title="' + d.label + '"></div>';
        });

        var firstDepth = tp.depths[0];
        var initHeight = ((firstDepth.end - firstDepth.start) / maxDepth) * 100;
        verticalProfile += '<div class="tp-depth-selector" id="tp-selector-' + tp.id + '" style="position:absolute;left:-3px;right:-3px;border:3px solid #cc6600;border-radius:2px;background:rgba(204,102,0,0.1);pointer-events:none;transition:all 0.2s;top:0;height:' + initHeight + '%;"></div>';
        verticalProfile += '</div>';

        // Data panels for each depth
        var panels = '';
        var fv = Utils.formatVal;
        tp.depths.forEach(function(d, i) {
            var display = i === 0 ? 'block' : 'none';
            var keyMetals = ['Mercury', 'Arsenic', 'Antimony', 'Thallium'];
            var metalRows = '';
            keyMetals.forEach(function(m) {
                var val = d.metals && d.metals[m] !== null ? d.metals[m] : null;
                var threshold = thresholds[m].high;
                var exceed = val !== null && val > threshold;
                var valText = val !== null ? val.toFixed(2) : '\u2014';
                var style = exceed ? 'color:#d63e2a;font-weight:bold;' : '';
                metalRows += '<tr><td>' + m + '</td><td style="' + style + '">' + valText + '</td><td>' + threshold + '</td></tr>';
            });

            // Full metals grid
            var fullGrid = '<div class="tp-full-metals" id="tp-fullmetals-' + tp.id + '-' + i + '" style="display:none;margin-top:8px;max-height:150px;overflow-y:auto;font-size:9px;">';
            fullGrid += '<table style="width:100%;border-collapse:collapse;">';
            AppConfig.allMetals.forEach(function(m) {
                var val = d.metals && d.metals[m] !== null ? d.metals[m] : null;
                var valText = val !== null ? fv(val) : '\u2014';
                fullGrid += '<tr style="border-bottom:1px solid #eee;"><td style="padding:2px;">' + m + '</td><td style="padding:2px;text-align:right;">' + valText + '</td></tr>';
            });
            fullGrid += '</table></div>';

            panels += '<div class="tp-depth-panel" id="tp-panel-' + tp.id + '-' + i + '" style="display:' + display + ';">' +
                '<table style="width:100%;font-size:10px;border-collapse:collapse;margin-top:4px;">' +
                '<tr style="background:#f5f5f5;"><th style="text-align:left;padding:3px;">Analyte</th><th style="padding:3px;">Result</th><th style="padding:3px;">ROD</th></tr>' +
                metalRows + '</table>' +
                '<button class="tp-toggle-metals-btn" data-tpid="' + tp.id + '" onclick="MarkersModule.toggleTPFullMetals(\'' + tp.id + '\', this)" style="margin-top:6px;font-size:9px;padding:2px 6px;cursor:pointer;">Show All Metals \u25bc</button>' +
                fullGrid + '</div>';
        });

        var depthDataAttr = 'data-depths=\'' + JSON.stringify(tp.depths.map(function(d) { return { start: d.start, end: d.end }; })) + '\' data-maxdepth="' + maxDepth + '"';

        // Depth tabs
        var depthTabs = '<div class="tp-depth-tabs" style="margin-bottom:6px;">';
        tp.depths.forEach(function(d, i) {
            var hasExceed = d.metals && (
                AppConfig.exceedsROD(d.metals.Mercury, 'Mercury') ||
                AppConfig.exceedsROD(d.metals.Arsenic, 'Arsenic') ||
                AppConfig.exceedsROD(d.metals.Antimony, 'Antimony') ||
                AppConfig.exceedsROD(d.metals.Thallium, 'Thallium')
            );
            var tabClass = 'tp-depth-tab' + (i === 0 ? ' active' : '') + (hasExceed ? ' exceed' : '');
            depthTabs += '<button class="' + tabClass + '" onclick="MarkersModule.showTPDepth(\'' + tp.id + '\',' + i + ')">' + d.label + '</button>';
        });
        depthTabs += '</div>';

        return '<div style="font-family: Arial; min-width: 280px;" ' + depthDataAttr + ' id="tp-popup-' + tp.id + '">' +
            '<h4 style="margin: 0 0 4px 0; color: #cc6600;">Test Pit: ' + tp.id + '</h4>' +
            '<div style="font-size:10px;color:#666;margin-bottom:6px;">' +
            '<b>Elev:</b> ' + elevText + ' | <b>TD:</b> ' + maxDepth + ' ft<br>' +
            '<b>Coord:</b> ' + tp.lat.toFixed(6) + ', ' + tp.lon.toFixed(6) + '</div>' +
            '<div style="display:flex;align-items:flex-start;gap:12px;">' +
                '<div style="flex:1;min-width:0;">' + depthTabs + panels + '</div>' +
                '<div style="display:flex;flex-direction:column;align-items:center;padding-right:20px;">' +
                    '<div style="font-size:8px;color:#666;margin-bottom:2px;">Depth</div>' + verticalProfile +
                '</div>' +
            '</div>' +
            '<div style="margin-top:6px;font-size:8px;color:#888;">Units: mg/kg | Click profile to select depth</div></div>';
    }

    function createTestPit2025Markers() {
        AppState.data.testPits2025.forEach(function(tp) {
            var marker = L.marker([tp.lat, tp.lon], {
                icon: L.divIcon({
                    className: 'tp2025-icon',
                    html: '<div style="color: #cc6600; font-size: 16px; font-weight: bold; text-shadow: 1px 1px 1px #000, -1px -1px 1px #000;">\u2715</div>',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            });
            marker.bindPopup(createTestPitPopup(tp), { maxWidth: 300, maxHeight: 400 });
            marker.bindTooltip('TP: ' + tp.id, { direction: 'top', offset: [0, -8] });
            marker.addTo(AppState.layers.testPits2025);
        });
    }

    // ===== 2025 SOIL BORINGS =====

    function createSoilBoringPopup(sb) {
        var elevText = sb.elev ? sb.elev.toFixed(1) + ' ft' : 'N/A';
        var hasData = sb.depths && sb.depths.length > 0;
        var areaName = sb.area || 'Unknown';

        if (!hasData) {
            return '<div style="font-family: Arial;">' +
                '<h4 style="margin: 0 0 6px 0; color: #0099cc;">Soil Boring: ' + sb.id + '</h4>' +
                '<div style="font-size:10px;color:#666;margin-bottom:6px;">' +
                '<b>Area:</b> ' + areaName + ' | <b>Elev:</b> ' + elevText + '<br>' +
                '<b>Coord:</b> ' + sb.lat.toFixed(6) + ', ' + sb.lon.toFixed(6) + '</div>' +
                '<i style="color:#888;">No lab data available</i></div>';
        }

        var maxDepth = Math.max.apply(null, sb.depths.map(function(d) { return d.end; }));
        var profileHeight = Math.min(200, Math.max(120, maxDepth * 2.5));

        // Vertical profile
        var verticalProfile = '<div class="sb-vertical-profile" id="sb-profile-' + sb.id + '" style="position:relative;width:35px;height:' + profileHeight + 'px;background:#f5f5f5;border:2px solid #333;border-radius:3px;flex-shrink:0;">';
        var markerInterval = maxDepth <= 20 ? 5 : (maxDepth <= 50 ? 10 : 20);
        for (var depth = 0; depth <= maxDepth; depth += markerInterval) {
            var topPct = (depth / maxDepth) * 100;
            verticalProfile += '<div style="position:absolute;right:-26px;top:' + topPct + '%;transform:translateY(-50%);font-size:8px;color:#666;">' + depth + '\'</div>';
            verticalProfile += '<div style="position:absolute;right:0;top:' + topPct + '%;width:4px;height:1px;background:#999;"></div>';
        }

        sb.depths.forEach(function(d, i) {
            var topPct = (d.start / maxDepth) * 100;
            var heightPct = ((d.end - d.start) / maxDepth) * 100;
            var hasHgExceed = d.metals.Mercury && d.metals.Mercury > 204;
            var hasAsExceed = d.metals.Arsenic && d.metals.Arsenic > 6.1;
            var color = (hasHgExceed || hasAsExceed) ? '#d63e2a' : (d.metals.Mercury === null ? '#ccc' : '#72af26');
            verticalProfile += '<div class="sb-depth-segment" data-idx="' + i + '" style="position:absolute;left:5px;right:5px;top:' + topPct + '%;height:' + heightPct + '%;background:' + color + ';border:1px solid rgba(0,0,0,0.2);cursor:pointer;transition:all 0.2s;" onclick="MarkersModule.showSBDepth(\'' + sb.id + '\',' + i + ')" title="' + d.label + '"></div>';
        });

        verticalProfile += '<div class="sb-depth-selector" id="sb-selector-' + sb.id + '" style="position:absolute;left:-3px;right:-3px;border:3px solid #0066cc;border-radius:2px;background:rgba(0,102,204,0.1);pointer-events:none;transition:all 0.2s;top:0;height:20%;"></div>';
        verticalProfile += '</div>';

        // Depth dropdown
        var depthSelect = '<select class="sb-depth-select" onchange="MarkersModule.showSBDepth(\'' + sb.id + '\', this.value)" id="sb-select-' + sb.id + '" style="width:100%;padding:4px;font-size:10px;margin-bottom:6px;">';
        sb.depths.forEach(function(d, i) {
            var hasExceed = (d.metals.Mercury && d.metals.Mercury > 204) || (d.metals.Arsenic && d.metals.Arsenic > 6.1);
            var exceedMark = hasExceed ? ' \u26a0\ufe0f' : '';
            depthSelect += '<option value="' + i + '">' + d.label + exceedMark + '</option>';
        });
        depthSelect += '</select>';

        // Data panels
        var panels = '';
        sb.depths.forEach(function(d, i) {
            var display = i === 0 ? 'block' : 'none';
            var hg = d.metals.Mercury;
            var as = d.metals.Arsenic;
            var hgExceed = hg !== null && hg > 204;
            var asExceed = as !== null && as > 6.1;
            var hgText = hg !== null ? hg.toFixed(2) : '\u2014';
            var asText = as !== null ? as.toFixed(2) : '\u2014';
            var hgStyle = hgExceed ? 'color:#d63e2a;font-weight:bold;' : '';
            var asStyle = asExceed ? 'color:#d63e2a;font-weight:bold;' : '';

            panels += '<div class="sb-depth-panel" id="sb-panel-' + sb.id + '-' + i + '" style="display:' + display + ';">' +
                '<div style="font-size:9px;color:#666;margin-bottom:4px;">CLP#: <b>' + (d.clp || 'N/A') + '</b></div>' +
                '<table style="width:100%;font-size:10px;border-collapse:collapse;">' +
                '<tr style="background:#f0f8ff;"><th style="text-align:left;padding:3px;">Analyte</th><th style="padding:3px;">Result</th><th style="padding:3px;">ROD</th></tr>' +
                '<tr><td style="padding:3px;">Mercury</td><td style="padding:3px;text-align:center;' + hgStyle + '">' + hgText + '</td><td style="padding:3px;text-align:center;">204</td></tr>' +
                '<tr><td style="padding:3px;">Arsenic</td><td style="padding:3px;text-align:center;' + asStyle + '">' + asText + '</td><td style="padding:3px;text-align:center;">6.1</td></tr>' +
                '<tr style="color:#999;"><td style="padding:3px;">Antimony</td><td style="padding:3px;text-align:center;">\u2014</td><td style="padding:3px;text-align:center;">51</td></tr>' +
                '<tr style="color:#999;"><td style="padding:3px;">Thallium</td><td style="padding:3px;text-align:center;">\u2014</td><td style="padding:3px;text-align:center;">1.3</td></tr>' +
                '</table></div>';
        });

        var depthDataAttr = 'data-depths=\'' + JSON.stringify(sb.depths.map(function(d) { return { start: d.start, end: d.end }; })) + '\' data-maxdepth="' + maxDepth + '"';

        return '<div style="font-family: Arial; min-width: 300px;" ' + depthDataAttr + ' id="sb-popup-' + sb.id + '">' +
            '<h4 style="margin: 0 0 4px 0; color: #0099cc;">Soil Boring: ' + sb.id + '</h4>' +
            '<div style="font-size:10px;color:#666;margin-bottom:6px;">' +
            '<b>Area:</b> ' + areaName + ' | <b>Elev:</b> ' + elevText + ' | <b>TD:</b> ' + maxDepth + ' ft<br>' +
            '<b>Coord:</b> ' + sb.lat.toFixed(6) + ', ' + sb.lon.toFixed(6) + '</div>' +
            '<div style="display:flex;align-items:flex-start;gap:12px;">' +
                '<div style="flex:1;min-width:0;">' +
                    '<div style="font-size:9px;margin-bottom:2px;color:#555;">Select Depth Interval:</div>' +
                    depthSelect + panels +
                '</div>' +
                '<div style="display:flex;flex-direction:column;align-items:center;padding-right:28px;">' +
                    '<div style="font-size:8px;color:#666;margin-bottom:2px;">Depth</div>' +
                    verticalProfile +
                    '<div style="font-size:7px;color:#888;margin-top:2px;">ft bgs</div>' +
                '</div>' +
            '</div>' +
            '<div style="margin-top:6px;font-size:8px;color:#888;">Units: mg/kg | Gray = pending data | Click profile to select</div></div>';
    }

    function createSoilBoringMarkers() {
        var style = AppConfig.markerStyles.soilBoring;
        AppState.data.soilBorings2025.forEach(function(sb) {
            var marker = L.circleMarker([sb.lat, sb.lon], {
                radius: style.radius,
                fillColor: style.fillColor,
                color: style.color,
                weight: style.weight,
                opacity: style.opacity,
                fillOpacity: style.fillOpacity
            });
            marker.bindPopup(createSoilBoringPopup(sb), { maxWidth: 280, maxHeight: 350 });
            marker.bindTooltip('SB: ' + sb.id, { direction: 'top', offset: [0, -8] });
            marker.addTo(AppState.layers.soilBorings2025);
        });
    }

    // ===== COLOR UPDATES =====

    function updateMarkerColors() {
        var analyte = AppState.currentAnalyte;

        // Update 2025 sampled markers
        AppState.layers.sampled2025.eachLayer(function(marker) {
            var sample = AppState.data.samples2025.find(function(s) { return s.num === marker.sampleNum; });
            if (sample && sample.metals) {
                var value = sample.metals[analyte];
                marker.setStyle({ fillColor: AppConfig.getColorForValue(value, analyte), color: '#000' });
            }
        });

        // Update EA markers
        AppState.layers.eaSamples.eachLayer(function(marker) {
            var sample = AppState.data.eaSamples.find(function(e) { return e.id === marker.sampleId; });
            if (sample) {
                var value = Utils.getSampleValue(sample, analyte, true);
                var newColor = AppConfig.getColorForValue(value, analyte);
                var triangleHtml = '<div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:14px solid ' + newColor + ';filter:drop-shadow(1px 1px 1px rgba(0,0,0,0.5));"></div>';
                marker.setIcon(L.divIcon({
                    className: 'ea-triangle',
                    html: triangleHtml,
                    iconSize: [16, 14],
                    iconAnchor: [8, 14]
                }));
            }
        });

        // Update legend text
        var thresh = AppConfig.thresholds[analyte];
        var legendTitle = document.querySelector('.section.legend h3');
        if (legendTitle) {
            legendTitle.textContent = 'Legend (' + analyte + ': ' + thresh.low + '/' + thresh.high + ' mg/kg)';
        }
    }

    // ===== LABEL MANAGEMENT =====

    function updateLabels() {
        AppState.labelLayer.clearLayers();
        var labelPositions = [];

        function findLabelPosition(lat, lon) {
            var baseLat = lat, baseLon = lon;
            var offsetDist = 0.00015;
            var directions = [
                { dx: 1, dy: 0.5 }, { dx: 1, dy: -0.5 }, { dx: -1, dy: 0.5 },
                { dx: -1, dy: -0.5 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
                { dx: 1.5, dy: 0 }, { dx: -1.5, dy: 0 }
            ];

            for (var mult = 1; mult <= 3; mult++) {
                for (var di = 0; di < directions.length; di++) {
                    var d = directions[di];
                    var newLat = baseLat + (d.dy * offsetDist * mult);
                    var newLon = baseLon + (d.dx * offsetDist * mult);
                    var overlap = false;

                    for (var pi = 0; pi < labelPositions.length; pi++) {
                        var pos = labelPositions[pi];
                        var dist = Math.sqrt(Math.pow(newLat - pos.lat, 2) + Math.pow(newLon - pos.lon, 2));
                        if (dist < offsetDist * 0.8) { overlap = true; break; }
                    }

                    if (!overlap) {
                        labelPositions.push({ lat: newLat, lon: newLon });
                        return { lat: newLat, lon: newLon, needsLine: true };
                    }
                }
            }

            var fallbackLat = baseLat + offsetDist;
            var fallbackLon = baseLon + offsetDist;
            labelPositions.push({ lat: fallbackLat, lon: fallbackLon });
            return { lat: fallbackLat, lon: fallbackLon, needsLine: true };
        }

        function addLabel(lat, lon, text, color) {
            var pos = findLabelPosition(lat, lon);
            if (pos.needsLine) {
                AppState.labelLayer.addLayer(
                    L.polyline([[lat, lon], [pos.lat, pos.lon]], { color: '#333', weight: 2, opacity: 0.9 })
                );
            }
            AppState.labelLayer.addLayer(
                L.marker([pos.lat, pos.lon], {
                    icon: L.divIcon({
                        className: 'sample-label',
                        html: '<div style="background:rgba(255,255,255,0.9);padding:1px 4px;border:1px solid ' + color + ';border-radius:2px;font-size:9px;font-weight:bold;color:' + color + ';white-space:nowrap;box-shadow:1px 1px 2px rgba(0,0,0,0.3);">' + text + '</div>',
                        iconSize: null,
                        iconAnchor: [0, 0]
                    }),
                    interactive: false
                })
            );
        }

        var data = AppState.data;
        if (document.getElementById('toggle2025Sampled').checked || document.getElementById('toggle2025NotSampled').checked) {
            data.samples2025.forEach(function(s) {
                if ((s.sampled && document.getElementById('toggle2025Sampled').checked) ||
                    (!s.sampled && document.getElementById('toggle2025NotSampled').checked)) {
                    addLabel(s.lat, s.lon, s.label, '#1F4E79');
                }
            });
        }
        if (document.getElementById('toggleEASamples').checked) {
            data.eaSamples.forEach(function(e) { addLabel(e.lat, e.lon, e.id, '#8B4513'); });
        }
        if (document.getElementById('toggleTestPits2025').checked) {
            data.testPits2025.forEach(function(tp) { addLabel(tp.lat, tp.lon, tp.id, '#cc6600'); });
        }
        if (document.getElementById('toggleSoilBorings2025').checked) {
            data.soilBorings2025.forEach(function(sb) { addLabel(sb.lat, sb.lon, sb.id, '#0066cc'); });
        }
        if (document.getElementById('toggleEATestPits').checked) {
            data.eaTestPits.forEach(function(tp) { addLabel(tp.lat, tp.lon, tp.id, '#9932CC'); });
        }
    }

    // ===== GLOBAL POPUP HANDLERS (called from onclick attributes) =====

    function toggleSSFullMetals(sampleId, btn) {
        var panel = document.getElementById('ss-fullmetals-' + sampleId);
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.textContent = 'Hide All Metals \u25b2';
            AppState.ssShowAllMetals[sampleId] = true;
        } else {
            panel.style.display = 'none';
            btn.textContent = 'Show All Metals \u25bc';
            AppState.ssShowAllMetals[sampleId] = false;
        }
    }

    function showTPDepth(tpId, depthIdx) {
        depthIdx = parseInt(depthIdx);
        document.querySelectorAll('[id^="tp-panel-' + tpId + '-"]').forEach(function(p) { p.style.display = 'none'; });
        var panel = document.getElementById('tp-panel-' + tpId + '-' + depthIdx);
        if (panel) panel.style.display = 'block';

        var popup = document.getElementById('tp-popup-' + tpId);
        if (popup) {
            popup.querySelectorAll('.tp-depth-tab').forEach(function(t, i) { t.classList.toggle('active', i === depthIdx); });
        }

        var selector = document.getElementById('tp-selector-' + tpId);
        if (popup && selector) {
            try {
                var depths = JSON.parse(popup.getAttribute('data-depths'));
                var maxDepth = parseFloat(popup.getAttribute('data-maxdepth'));
                var d = depths[depthIdx];
                selector.style.top = (d.start / maxDepth) * 100 + '%';
                selector.style.height = ((d.end - d.start) / maxDepth) * 100 + '%';
            } catch (ex) { /* ignore parse errors */ }
        }

        if (AppState.tpShowAllMetals[tpId]) {
            var fullMetalsDiv = document.getElementById('tp-fullmetals-' + tpId + '-' + depthIdx);
            var btn = panel ? panel.querySelector('.tp-toggle-metals-btn') : null;
            if (fullMetalsDiv) fullMetalsDiv.style.display = 'block';
            if (btn) btn.textContent = 'Hide All Metals \u25b2';
        }
    }

    function toggleTPFullMetals(tpId, btn) {
        var panel = btn.nextElementSibling;
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            btn.textContent = 'Hide All Metals \u25b2';
            AppState.tpShowAllMetals[tpId] = true;
        } else {
            panel.style.display = 'none';
            btn.textContent = 'Show All Metals \u25bc';
            AppState.tpShowAllMetals[tpId] = false;
        }
    }

    function showSBDepth(sbId, depthIdx) {
        depthIdx = parseInt(depthIdx);
        document.querySelectorAll('[id^="sb-panel-' + sbId + '-"]').forEach(function(p) { p.style.display = 'none'; });
        var panel = document.getElementById('sb-panel-' + sbId + '-' + depthIdx);
        if (panel) panel.style.display = 'block';

        var select = document.getElementById('sb-select-' + sbId);
        if (select) select.value = depthIdx;

        var popup = document.getElementById('sb-popup-' + sbId);
        var selector = document.getElementById('sb-selector-' + sbId);
        if (popup && selector) {
            try {
                var depths = JSON.parse(popup.getAttribute('data-depths'));
                var maxDepth = parseFloat(popup.getAttribute('data-maxdepth'));
                var d = depths[depthIdx];
                selector.style.top = (d.start / maxDepth) * 100 + '%';
                selector.style.height = ((d.end - d.start) / maxDepth) * 100 + '%';
            } catch (ex) { /* ignore parse errors */ }
        }
    }

    // Public API
    return {
        init: init,
        updateMarkerColors: updateMarkerColors,
        updateLabels: updateLabels,
        // Global handlers for onclick attributes in popups
        toggleSSFullMetals: toggleSSFullMetals,
        showTPDepth: showTPDepth,
        toggleTPFullMetals: toggleTPFullMetals,
        showSBDepth: showSBDepth
    };
})();
