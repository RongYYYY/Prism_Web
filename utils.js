// utils.js

/**
 * Blend multiple RGBA colors additively, returning a CSS rgba string.
 * @param {Array<[number, number, number, number]>} colors - Array of [r, g, b, a] (0-255)
 * @returns {string} - CSS rgba() string with full opacity
 */
function additive_blend(colors) {
    let r = 0, g = 0, b = 0;
    for (const [cr, cg, cb, ca] of colors) {
        const alpha = ca / 255.0;
        r += cr * alpha;
        g += cg * alpha;
        b += cb * alpha;
    }
    r = Math.min(Math.round(r), 255);
    g = Math.min(Math.round(g), 255);
    b = Math.min(Math.round(b), 255);
    return `rgba(${r},${g},${b},1)`;
}
