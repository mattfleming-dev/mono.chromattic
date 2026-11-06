// ---------------------------------------------------------------------------
// Journal layout configuration
//
// Controls how the journal grid is laid out. Two shapes are supported:
//   'masonry'   — classic Pinterest-style CSS-columns grid (rounded cards)
//   'honeycomb' — staggered "hive" grid of clipped cells
//
// Inside honeycomb, the corner clip comes from `shapes` / `shapeName`.
// When shapeName is 'hexagon' the grid uses a true bee-wax tessellation of
// regular FLAT-TOP hexagons (flat side on top, all six sides equal):
//   • columns are laid edge-to-edge, overlapping horizontally by a quarter
//     of a cell width (the left/right points nestle into the neighbors)
//   • every even-numbered column drops by half a cell height
//   • `cellGap` leaves a small air gap between adjacent cells (each hexagon
//     is inset by cellGap / 2 inside its tessellation slot)
//
// The Hive layout is experimental and can only be enabled through
// `pages.journal.html.experimentalHive` in page-templates.json.
// ---------------------------------------------------------------------------

window.JOURNAL_LAYOUT = {
    /** Default grid shape: 'masonry' | 'honeycomb'. */
    shape: 'masonry',

    /** Column count for wide hive content areas. */
    baseColumns: 4,

    /**
     * Responsive column counts. Each entry applies when the available grid
     * width is <= maxWidth. Keep thresholds ordered from narrowest to widest.
     */
    columns: [
        { maxWidth: 640,  count: 1 },
        { maxWidth: 900,  count: 2 },
        { maxWidth: 1750, count: 3 }
    ],

    /**
     * Maximum hex cell width in px (cells shrink to fit the column count).
     * Cell height is derived: h = w / 1.1547 keeps all six sides equal.
     */
    cellWidth: 528,

    /** Minimum buffer (px) around each cell face; it grows up to cellGapMax. */
    cellGap: 7,
    cellGapMax: 14,

    /**
     * Vertical stagger (rem) for even columns — used by the relaxed
     * honeycomb layout (octagon / rounded shapes). The true hex tessellation
     * computes its own offset geometrically and ignores this value.
     */
    offset: 2.5,

    /**
     * Corner-clip shapes for honeycomb cells (CSS clip-path values).
     * Set a value to 'none' to disable clipping for a shape.
     */
    shapes: {
        // Regular flat-top hexagon: equal sides when the cell box has a
        // width/height ratio of 1.1547 (the grid enforces this via aspect-ratio)
        hexagon: 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)',
        // 26px beveled corners → octagon
        octagon: 'polygon(26px 0, calc(100% - 26px) 0, 100% 26px, 100% calc(100% - 26px), calc(100% - 26px) 100%, 26px 100%, 0 calc(100% - 26px), 0 26px)',
        // Plain card (no clip)
        rounded: 'none'
    },

    /** Which clip shape honeycomb cells use: 'hexagon' | 'octagon' | 'rounded'. */
    shapeName: 'hexagon'
};
