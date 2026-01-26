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

## Features

### 📍 Sample Visualization
- **2025 Jacobs Samples (41 locations):** Circles showing sampled and not-yet-sampled locations
- **EA Historical Samples (54 locations):** Triangles from previous site investigations
- **EA Test Pits (5 locations):** Purple squares with pH and lithology notes
- **Color-coded by concentration:** Red (HIGH), Orange (MEDIUM), Green (LOW), Gray (Not Sampled)

### 🎨 Color by Analyte
Switch map display between contaminants of concern:
| Analyte | Screening Level | 10x Screening |
|---------|-----------------|---------------|
| Mercury (Hg) | 58 mg/kg | 580 mg/kg |
| Arsenic (As) | 6.1 mg/kg | 61 mg/kg |
| Antimony (Sb) | 7.5 mg/kg | 75 mg/kg |
| Thallium (Tl) | 0.4 mg/kg | 4 mg/kg |

### 🔍 Data Gap Analysis
- Grid-based visualization showing sampling density
- Adjustable grid size (25ft, 50ft, 75ft, 100ft)
- Color coding:
  - **Red** = No samples within radius (data gap - needs sampling)
  - **Yellow** = 1-2 samples (sparse coverage)
  - **Green** = 3+ samples (adequate coverage)
- Dynamic updates as planned points are added
- Toggle button to include/exclude planned points from analysis

### 🔥 Hot Zone Analysis
- Identifies areas of elevated contamination based on selected analyte
- Uses maximum concentration within search radius
- Color coding:
  - **Red** = HIGH (exceeds 10x screening level)
  - **Orange** = MEDIUM (between 1x and 10x screening)
  - **Green** = LOW (below screening level)
- Helps prioritize investigation and delineation areas

### 📏 Measurement Tool
- Click any two points to measure distance
- Displays results in both feet and meters
- Useful for verifying sample spacing requirements

### 📝 Sample Planning
- **Proposed Points (Blue diamonds):** Primary planned sample locations
- **Step-out Points (Orange diamonds):** Delineation or contingency samples
- **Depth Selection:** Shallow, Deep, or Both
- **Notes Field:** Add comments or rationale for each location
- **Drag to Reposition:** Fine-tune locations after placement
- **Click to Edit:** Modify notes and depth anytime
- **Smart Numbering:** Fills gaps when points are deleted (P-1, P-2, delete P-2, next point = P-2)

### 📥 Export & Import
- **CSV Export:** Downloads spreadsheet with Point_ID, Type, Depth, Latitude, Longitude, Note
- **CSV Load:** Import previously exported CSV to restore planned points
- **Copy to Clipboard:** Quick text copy for pasting into emails or documents

### Saving & Loading Your Work
The tool doesn't save points between sessions, but you can:
1. **Export to CSV** when done planning
2. **Load CSV** later to restore your points
3. Share the CSV file with team members who can load it into their tool

### 🗺️ Map Controls
- Google Satellite imagery base layer
- Layer toggles to show/hide each data type
- Real-time cursor coordinate display
- Scale bar in feet and meters
- Click sample in sidebar list to zoom to location

---

## Data Sources

| Dataset | Source | Count |
|---------|--------|-------|
| 2025 Soil Samples | Jacobs PDI Investigation | 41 locations (32 sampled, 9 pending) |
| EA Historical Samples | EA Engineering RI/FS | 54 locations (ABWP01 & ABWP02 areas) |
| EA Test Pits | EA Engineering | 5 locations with pH and lithology data |

---

## How to Use

### Basic Navigation
1. Open the tool in any modern web browser
2. Use mouse scroll wheel or +/- buttons to zoom
3. Click and drag to pan the map
4. Click any sample marker to view detailed analytical results

### Planning New Sample Locations
1. Select **Proposed** (blue) or **Step-out** (orange) mode in the sidebar
2. Click on the map where you want to place a sample
3. Select depth interval: Shallow, Deep, or Both
4. Add optional notes describing rationale
5. Click **Add** to confirm placement

### Editing Planned Points
- **Click on map marker:** Opens edit popup with depth selector and notes field
- **Click in sidebar list:** Zooms to point and opens edit popup
- **Drag marker:** Reposition by dragging on map
- **Delete:** Click × in sidebar or Delete button in popup

### Using Analysis Tools
1. **Data Gaps:** Activates density grid overlay
   - Use +/- buttons to adjust grid size
   - Toggle 📍 On/Off to include or exclude your planned points
2. **Hot Zones:** Shows contamination intensity grid based on selected analyte
3. **Measure:** Click button, then click two map points for distance
4. **Color by:** Dropdown to switch analyte coloring for all markers

### Exporting Your Plan
1. Add all desired planned sample locations
2. Click **CSV** to download a spreadsheet file
3. Or click **Copy** to copy text to clipboard

### Loading Saved Points
1. Click **Load** button in the planning actions
2. Select a previously exported CSV file
3. Choose to replace existing points or add to them
4. Points appear on map ready for further editing
5. Share CSV files with team members to collaborate

---

## Technical Information

- **Framework:** Leaflet.js v1.9.4 (open-source mapping library)
- **Base Map:** Google Satellite Imagery
- **Coordinate System:** WGS84 Geographic (Latitude/Longitude)
- **File Format:** Self-contained HTML (no server required)
- **Browser Support:** Chrome, Firefox, Edge, Safari

The tool runs entirely in your web browser - no installation or server connection required after initial load.

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| REV3 | January 2026 | CSV import/load, hot zone analysis, adjustable grid size, depth selection, point editing, planned points toggle, watermark |
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

*© 2026 Jacobs Engineering - Internal Use Only*
