/**
 * SBMM Planning Tool - Utility Functions
 *
 * Shared helper functions used across modules.
 */
var Utils = (function() {
    'use strict';

    /**
     * Format a numeric value for display. Returns em-dash for null/undefined/NaN.
     * @param {number|null} val
     * @returns {string}
     */
    function fmt(val) {
        if (val === null || val === undefined || isNaN(val)) return '\u2014';
        return Number(val).toLocaleString();
    }

    /**
     * Format a value with appropriate decimal places based on magnitude.
     * @param {number|null} val
     * @returns {string}
     */
    function formatVal(val) {
        if (val === null || val === undefined) return '\u2014';
        if (val >= 1000) return val.toFixed(0);
        if (val >= 1) return val.toFixed(1);
        return val.toFixed(2);
    }

    /**
     * Create a DOM element with attributes and children.
     * Safer alternative to innerHTML for building UI.
     * @param {string} tag
     * @param {Object} attrs
     * @param {Array|string} children
     * @returns {HTMLElement}
     */
    function createElement(tag, attrs, children) {
        var el = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function(key) {
                if (key === 'className') {
                    el.className = attrs[key];
                } else if (key === 'style' && typeof attrs[key] === 'object') {
                    Object.keys(attrs[key]).forEach(function(prop) {
                        el.style[prop] = attrs[key][prop];
                    });
                } else if (key.startsWith('on') && typeof attrs[key] === 'function') {
                    el.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
                } else {
                    el.setAttribute(key, attrs[key]);
                }
            });
        }
        if (children !== undefined && children !== null) {
            if (Array.isArray(children)) {
                children.forEach(function(child) {
                    if (typeof child === 'string') {
                        el.appendChild(document.createTextNode(child));
                    } else if (child instanceof HTMLElement) {
                        el.appendChild(child);
                    }
                });
            } else if (typeof children === 'string') {
                el.textContent = children;
            }
        }
        return el;
    }

    /**
     * Parse a CSV line handling quoted fields with commas.
     * @param {string} line
     * @returns {string[]}
     */
    function parseCSVLine(line) {
        var result = [];
        var current = '';
        var inQuotes = false;

        for (var i = 0; i < line.length; i++) {
            var char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }

    /**
     * Get analyte value from a sample object.
     * Handles the different data structures of 2025 vs EA samples.
     * @param {Object} sample
     * @param {string} analyte
     * @param {boolean} isEA - true if EA historical sample
     * @returns {number|null}
     */
    function getSampleValue(sample, analyte, isEA) {
        if (isEA) {
            switch (analyte) {
                case 'Mercury': return sample.mercury;
                case 'Arsenic': return sample.arsenic;
                case 'Antimony': return sample.antimony;
                case 'Thallium': return sample.thallium;
            }
        } else {
            return sample.metals ? sample.metals[analyte] : null;
        }
        return null;
    }

    /**
     * Fetch a JSON data file.
     * @param {string} url - Path to JSON file
     * @returns {Promise<Array>}
     */
    function loadJSON(url) {
        return fetch(url)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to load ' + url + ': ' + response.statusText);
                }
                return response.json();
            });
    }

    return {
        fmt: fmt,
        formatVal: formatVal,
        createElement: createElement,
        parseCSVLine: parseCSVLine,
        getSampleValue: getSampleValue,
        loadJSON: loadJSON
    };
})();
