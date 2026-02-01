/**
 * SBMM Planning Tool - Point Planning
 *
 * Handles adding, editing, deleting, and displaying planned sampling points.
 */
var PlanningModule = (function() {
    'use strict';

    /**
     * Set the current planning mode.
     * @param {string} mode - 'view' | 'proposed' | 'stepout'
     */
    function setMode(mode) {
        AppState.currentMode = mode;
        document.getElementById('btn-view').className = 'mode-btn' + (mode === 'view' ? ' active-view' : '');
        document.getElementById('btn-proposed').className = 'mode-btn' + (mode === 'proposed' ? ' active-proposed' : '');
        document.getElementById('btn-stepout').className = 'mode-btn' + (mode === 'stepout' ? ' active-stepout' : '');
        document.getElementById('map').classList.toggle('planning-mode', mode !== 'view');
    }

    /**
     * Get the next available point number for a type.
     * Fills gaps when points are deleted (e.g., P-1, P-3 -> next is P-2).
     * @param {string} type - 'proposed' | 'stepout'
     * @returns {number}
     */
    function getNextPointNumber(type) {
        var prefix = AppConfig.pointTypes[type].prefix;
        var usedNums = [];
        AppState.plannedPoints.forEach(function(p) {
            if (p.id.startsWith(prefix)) {
                var num = parseInt(p.id.substring(prefix.length));
                usedNums.push(num);
            }
        });
        var nextNum = 1;
        while (usedNums.indexOf(nextNum) !== -1) {
            nextNum++;
        }
        return nextNum;
    }

    /**
     * Show the add-point confirmation popup at a map location.
     * @param {L.LatLng} latlng
     */
    function showAddPointPopup(latlng) {
        var lat = latlng.lat;
        var lon = latlng.lng;
        var mode = AppState.currentMode;
        var typeConfig = AppConfig.pointTypes[mode];
        var pointNum = getNextPointNumber(mode);
        var pointId = typeConfig.prefix + pointNum;

        // Build depth options
        var depthOptionsHtml = AppConfig.depthOptions.map(function(opt) {
            return '<option value="' + opt + '">' + opt + '</option>';
        }).join('');

        var popupContent =
            '<div style="font-family: Arial; padding: 5px;">' +
            '<h4 style="color: ' + typeConfig.color + '; margin: 0 0 8px 0;">Add ' + typeConfig.label + '</h4>' +
            '<div style="font-size: 11px; margin-bottom: 5px;"><b>ID:</b> ' + pointId + '</div>' +
            '<div style="font-size: 10px; margin-bottom: 8px; font-family: monospace;">' + lat.toFixed(6) + ', ' + lon.toFixed(6) + '</div>' +
            '<div style="margin-bottom: 6px;">' +
                '<label style="font-size: 10px; display: block; margin-bottom: 2px;">Depth:</label>' +
                '<select id="pointDepth" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px; font-size: 10px;">' +
                depthOptionsHtml + '</select></div>' +
            '<input type="text" id="pointNote" placeholder="Note..." style="width: 100%; padding: 4px; margin-bottom: 6px; border: 1px solid #ccc; border-radius: 3px; font-size: 10px;">' +
            '<div style="display: flex; gap: 5px;">' +
                '<button onclick="PlanningModule.confirmAddPoint()" style="flex: 1; padding: 5px; background: #1F4E79; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Add</button>' +
                '<button onclick="PlanningModule.cancelAddPoint()" style="flex: 1; padding: 5px; background: #ccc; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Cancel</button>' +
            '</div></div>';

        AppState.pendingPoint = { lat: lat, lon: lon, type: mode, id: pointId };
        L.popup({ closeButton: false }).setLatLng(latlng).setContent(popupContent).openOn(AppState.map);
    }

    /**
     * Confirm adding the pending point.
     */
    function confirmAddPoint() {
        if (!AppState.pendingPoint) return;
        var noteInput = document.getElementById('pointNote');
        var depthSelect = document.getElementById('pointDepth');
        var note = noteInput ? noteInput.value : '';
        var depth = depthSelect ? depthSelect.value : 'Shallow';
        var pending = AppState.pendingPoint;

        var point = {
            id: pending.id,
            type: pending.type,
            lat: pending.lat,
            lon: pending.lon,
            note: note,
            depth: depth,
            color: AppConfig.pointTypes[pending.type].color
        };

        AppState.plannedPoints.push(point);
        addPlannedMarker(point);
        updatePlannedPointsList();
        AppState.map.closePopup();
        AppState.pendingPoint = null;

        // Refresh gap grid if visible
        if (AppState.gapsVisible) AnalysisModule.createGapGrid();
    }

    /**
     * Cancel adding a point.
     */
    function cancelAddPoint() {
        AppState.map.closePopup();
        AppState.pendingPoint = null;
    }

    /**
     * Create a draggable marker for a planned point.
     * @param {Object} point
     */
    function addPlannedMarker(point) {
        var marker = L.marker([point.lat, point.lon], {
            draggable: true,
            icon: L.divIcon({
                className: 'planned-marker',
                html: '<div style="width: 14px; height: 14px; background: ' + point.color + '44; border: 3px solid ' + point.color + '; transform: rotate(45deg); cursor: move;"></div>',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            })
        });

        function getEditPopupContent() {
            var typeConfig = AppConfig.pointTypes[point.type];
            var currentDepth = point.depth || 'Shallow';
            var depthOptionsHtml = AppConfig.depthOptions.map(function(opt) {
                return '<option value="' + opt + '"' + (currentDepth === opt ? ' selected' : '') + '>' + opt + '</option>';
            }).join('');

            return '<div style="font-family: Arial; padding: 5px; min-width: 200px;">' +
                '<h4 style="color: ' + point.color + '; margin: 0 0 8px 0;">' + typeConfig.label + ': ' + point.id + '</h4>' +
                '<div style="font-size: 10px; margin-bottom: 8px; font-family: monospace;">' + point.lat.toFixed(6) + ', ' + point.lon.toFixed(6) + '</div>' +
                '<div style="margin-bottom: 6px;">' +
                    '<label style="font-size: 10px; display: block; margin-bottom: 2px;">Depth:</label>' +
                    '<select id="editPointDepth" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 3px; font-size: 10px;">' +
                    depthOptionsHtml + '</select></div>' +
                '<input type="text" id="editPointNote" value="' + (point.note || '').replace(/"/g, '&quot;') + '" placeholder="Note..." style="width: 100%; padding: 4px; margin-bottom: 6px; border: 1px solid #ccc; border-radius: 3px; font-size: 10px;">' +
                '<div style="display: flex; gap: 5px;">' +
                    '<button onclick="PlanningModule.savePointNote(\'' + point.id + '\')" style="flex: 1; padding: 5px; background: #1F4E79; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Save</button>' +
                    '<button onclick="PlanningModule.deletePointById(\'' + point.id + '\')" style="flex: 1; padding: 5px; background: #aa3333; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Delete</button>' +
                '</div>' +
                '<div style="font-size: 9px; color: #888; margin-top: 6px; text-align: center;">Drag marker to reposition</div></div>';
        }

        marker.bindPopup(getEditPopupContent);
        marker.bindTooltip(point.id, { permanent: true, direction: 'top', offset: [0, -8] });
        marker.pointId = point.id;
        marker.pointRef = point;

        marker.on('dragend', function(e) {
            var newLatLng = e.target.getLatLng();
            point.lat = newLatLng.lat;
            point.lon = newLatLng.lng;
            updatePlannedPointsList();
            if (AppState.gapsVisible) AnalysisModule.createGapGrid();
        });

        marker.addTo(AppState.layers.planned);
    }

    /**
     * Save edits to a planned point's note and depth.
     * @param {string} pointId
     */
    function savePointNote(pointId) {
        var noteInput = document.getElementById('editPointNote');
        var depthSelect = document.getElementById('editPointDepth');
        if (!noteInput) return;

        var point = AppState.plannedPoints.find(function(p) { return p.id === pointId; });
        if (point) {
            point.note = noteInput.value;
            point.depth = depthSelect ? depthSelect.value : 'Shallow';
            updatePlannedPointsList();
        }
        AppState.map.closePopup();
    }

    /**
     * Delete a planned point by its ID.
     * @param {string} pointId
     */
    function deletePointById(pointId) {
        var idx = AppState.plannedPoints.findIndex(function(p) { return p.id === pointId; });
        if (idx !== -1) {
            deletePoint(idx);
        }
        AppState.map.closePopup();
    }

    /**
     * Delete a planned point by array index.
     * @param {number} idx
     */
    function deletePoint(idx) {
        var point = AppState.plannedPoints[idx];
        AppState.layers.planned.eachLayer(function(layer) {
            if (layer.pointId === point.id) AppState.layers.planned.removeLayer(layer);
        });
        AppState.plannedPoints.splice(idx, 1);
        updatePlannedPointsList();
        if (AppState.gapsVisible) AnalysisModule.createGapGrid();
    }

    /**
     * Undo the last added planned point.
     */
    function undoLast() {
        if (AppState.plannedPoints.length > 0) {
            deletePoint(AppState.plannedPoints.length - 1);
        }
    }

    /**
     * Clear all planned points (with confirmation).
     */
    function clearAllPlanned() {
        if (AppState.plannedPoints.length === 0 || !confirm('Clear all points?')) return;
        AppState.layers.planned.clearLayers();
        AppState.plannedPoints = [];
        updatePlannedPointsList();
        if (AppState.gapsVisible) AnalysisModule.createGapGrid();
    }

    /**
     * Update the sidebar list of planned points.
     */
    function updatePlannedPointsList() {
        var listDiv = document.getElementById('plannedPointsList');
        var countEl = document.getElementById('pointCount');
        if (countEl) countEl.textContent = AppState.plannedPoints.length;

        if (AppState.plannedPoints.length === 0) {
            listDiv.innerHTML = '<div class="no-points">Click map in Proposed/Step-out mode</div>';
            return;
        }

        var html = '';
        AppState.plannedPoints.forEach(function(p, idx) {
            var depthAbbr = (p.depth || 'Shallow').charAt(0);
            var noteText = p.note ? ' ' + p.note.substring(0, 12) + (p.note.length > 12 ? '..' : '') : '';
            html += '<div class="planned-point ' + p.type + '" data-pointid="' + p.id + '" style="cursor:pointer;">' +
                '<span class="name">' + p.id + '</span>' +
                '<span class="coords">[' + depthAbbr + '] ' + p.lat.toFixed(5) + ', ' + p.lon.toFixed(5) + noteText + '</span>' +
                '<button class="delete-btn" data-idx="' + idx + '">\u00d7</button></div>';
        });
        listDiv.innerHTML = html;

        // Rebind click events
        listDiv.querySelectorAll('.planned-point').forEach(function(item) {
            item.addEventListener('click', function(e) {
                if (e.target.classList.contains('delete-btn')) return;
                var pointId = this.getAttribute('data-pointid');
                zoomToPlannedPoint(pointId);
            });
        });
        listDiv.querySelectorAll('.delete-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                deletePoint(parseInt(this.getAttribute('data-idx')));
            });
        });
    }

    /**
     * Zoom to and open popup for a planned point.
     * @param {string} pointId
     */
    function zoomToPlannedPoint(pointId) {
        AppState.layers.planned.eachLayer(function(layer) {
            if (layer.pointId === pointId) {
                AppState.map.setView(layer.getLatLng(), 19);
                layer.openPopup();
            }
        });
    }

    // Public API
    return {
        setMode: setMode,
        showAddPointPopup: showAddPointPopup,
        confirmAddPoint: confirmAddPoint,
        cancelAddPoint: cancelAddPoint,
        addPlannedMarker: addPlannedMarker,
        savePointNote: savePointNote,
        deletePointById: deletePointById,
        deletePoint: deletePoint,
        undoLast: undoLast,
        clearAllPlanned: clearAllPlanned,
        updatePlannedPointsList: updatePlannedPointsList
    };
})();
