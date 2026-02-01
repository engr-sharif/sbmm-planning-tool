# SBMM ABP Soil Sampling Planning Tool

An interactive web-based mapping tool for planning and visualizing soil sampling activities at the Sulphur Bank Mercury Mine (SBMM) Superfund Site - Operable Unit 1 (OU1) Area Between Piles (ABP).

---

## Overview

This tool was developed to support the Pre-Design Investigation (PDI) and Round 2 sampling planning efforts at the SBMM Superfund site in Lake County, California. It combines 2025 Jacobs sampling data with historical EA Engineering data to provide a comprehensive view of soil contamination patterns and data gaps across the Area Between Piles.

The tool enables field teams and project engineers to:
- Visualize existing sample locations and analytical results
- Identify data gaps requiring additional characterization
- Plan proposed and step-out sample locations
- Analyze contamination hot zones by analyte
- Export planned locations for field implementation

---

## Quick Start

### Option 1: Original Single-File Version
Open `index.html` directly in your browser. No server needed.

### Option 2: Modular Version (v2)
The modular version loads data from separate JSON files, which requires an HTTP server:

```bash
# Using Python (most systems have this)
python -m http.server 8000

# Or using Node.js
npx serve .
```

Then open `http://localhost:8000/index-v2.html` in your browser.

---

## Project Structure

```
sbmm-planning-tool/
├── index.html              # Original single-file version (standalone)
├── index-v2.html           # Modular version (requires HTTP server)
├── css/
│   └── styles.css          # All application styles
├── js/
│   ├── config.js           # Thresholds, constants, map defaults
│   ├── state.js            # Centralized application state
│   ├── utils.js            # Shared utility functions
│   ├── map.js              # Leaflet map setup and layer initialization
│   ├── markers.js          # Marker creation and popup content
│   ├── planning.js         # Point planning (add, edit, delete, drag)
│   ├── analysis.js         # Data gap, hot zone, and measurement tools
│   ├── export.js           # CSV export/import, clipboard
│   └── app.js              # Application entry point and event binding
├── data/
│   ├── samples-2025.json   # 41 Jacobs 2025 surface samples
│   ├── ea-samples.json     # 54 EA historical samples
│   ├── ea-test-pits.json   # 5 EA test pit locations
│   ├── test-pits-2025.json # 51 Jacobs 2025 test pits
│   └── soil-borings-2025.json  # 44 Jacobs 2025 soil borings
└── README.md
```

### Updating Data

To update sample data, edit the JSON files in the `data/` directory. Each file is a JSON array of objects. The application loads these files on startup and no code changes are needed.

**Example:** To add a new 2025 sample, append an object to `data/samples-2025.json`:
```json
{
    "num": 42,
    "label": "SS42",
    "lat": 39.005000,
    "lon": -122.671000,
    "sampled": true,
    "color": "#72af26",
    "priority": "Round 2",
    "metals": {
        "Mercury": 15.2,
        "Arsenic": 3.1,
        "Antimony": 2.5,
        "Thallium": 0.8
    }
}
```

### Updating Thresholds

ROD cleanup levels and screening values are defined in `js/config.js`. To update them, edit the `thresholds` object:
```javascript
var thresholds = {
    Mercury:  { low: 35,  high: 204, unit: 'mg/kg', abbrev: 'Hg' },
    Arsenic:  { low: 6.1, high: 6.1, unit: 'mg/kg', abbrev: 'As' },
    // ...
};
```

---

## Features

### Sample Visualization
- **2025 Jacobs Samples (41 locations):** Circles showing sampled and not-yet-sampled locations
- **EA Historical Samples (54 locations):** Triangles from previous site investigations
- **EA Test Pits (5 locations):** Purple squares with pH and lithology notes
- **2025 Test Pits (51 locations):** With depth profiles and multi-interval data
- **2025 Soil Borings (44 locations):** With vertical depth profiles
- **Color-coded by concentration:** Red (HIGH), Orange (MEDIUM), Green (LOW), Gray (Not Sampled)

### Color by Analyte
Switch map display between contaminants of concern:
| Analyte | PMB (mg/kg) | ROD Cleanup Level (mg/kg) |
|---------|-------------|---------------------------|
| Mercury (Hg) | 35 | 204 |
| Arsenic (As) | 6.1 | 6.1 |
| Antimony (Sb) | 7.1 | 51 |
| Thallium (Tl) | 1.3 | 1.3 |

### Data Gap Analysis
- Grid-based visualization showing sampling density
- Adjustable grid size (25ft, 50ft, 75ft, 100ft)
- Red = No samples (data gap), Yellow = Sparse (1-2), Green = Adequate (3+)
- Dynamic updates as planned points are added
- Toggle to include/exclude planned points

### Hot Zone Analysis
- Identifies areas of elevated contamination based on selected analyte
- Uses maximum concentration within search radius
- Red = Exceeds ROD, Orange = Above PMB, Green = Below PMB

### Measurement Tool
- Click any two points to measure distance
- Displays results in both feet and meters

### Sample Planning
- **Proposed Points (Blue diamonds):** Primary planned sample locations
- **Step-out Points (Orange diamonds):** Delineation or contingency samples
- **Depth Selection:** Shallow, Deep, or Both
- **Notes Field:** Add comments or rationale for each location
- **Drag to Reposition:** Fine-tune locations after placement
- **Smart Numbering:** Fills gaps when points are deleted

### Export & Import
- **CSV Export:** Downloads spreadsheet with Point_ID, Type, Depth, Latitude, Longitude, Note
- **CSV Load:** Import previously exported CSV to restore planned points
- **Copy to Clipboard:** Quick text copy for pasting into emails or documents

---

## Data Sources

| Dataset | Source | Count |
|---------|--------|-------|
| 2025 Soil Samples | Jacobs PDI Investigation | 41 locations (32 sampled, 9 pending) |
| 2025 Test Pits | Jacobs PDI Investigation | 51 locations |
| 2025 Soil Borings | Jacobs PDI Investigation | 44 locations |
| EA Historical Samples | EA Engineering RI/FS | 54 locations (ABWP01 & ABWP02 areas) |
| EA Test Pits | EA Engineering | 5 locations with pH and lithology data |

---

## Technical Information

- **Framework:** Leaflet.js v1.9.4 (open-source mapping library)
- **Base Map:** Google Satellite Imagery
- **Coordinate System:** WGS84 Geographic (Latitude/Longitude)
- **Architecture:** Modular JavaScript (IIFE pattern, no build step)
- **Browser Support:** Chrome, Firefox, Edge, Safari

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| v2.0 | February 2026 | Modular architecture: separate CSS/JS/JSON files, centralized config, data-driven thresholds |
| REV3 | January 2026 | CSV import/load, hot zone analysis, adjustable grid size, depth selection, point editing |
| REV2 | January 2026 | Data gap analysis, measurement tool, color by analyte selector |
| REV1 | January 2026 | Initial release with mapping and basic planning features |

---

## Project Information

**Site:** Sulphur Bank Mercury Mine Superfund Site
**Operable Unit:** OU1 - Area Between Piles (ABP)
**Location:** Lake County, California
**Client:** U.S. Environmental Protection Agency (EPA) Region 9
**Contractor:** Jacobs Engineering Group

---

## Author & Credits

**Developed by:** Mo Sharif, EIT
**Organization:** Jacobs Engineering
**Year:** 2026

---

## Disclaimer

This tool is intended for internal planning purposes only. All proposed sample locations should be field-verified for accessibility and safety, and approved by the project manager and EPA prior to implementation. Analytical data displayed is subject to final validation and quality assurance review.

---

*2026 Jacobs Engineering - Internal Use Only*
