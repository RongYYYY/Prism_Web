// iso_board.js

// Assumes: constants.js, plate.js are loaded

class IsoBoard {
    static startX = 160;
    static startY = 180;

    /**
     * @param {Array<Plate>} plates
     * @param {number} scale
     * @param {[number, number]} offset
     */
    constructor(plates, scale = 1, offset = [IsoBoard.startX, IsoBoard.startY]) {
        this.plates = plates;
        this.isoPlates = IsoBoard.compute_iso_plates(plates, scale, offset);
    }

    static compute_conversion(x, y, scale, offset) {
        const ex = scale * (x + 4.5 * x) + offset[0];
        const ey = scale * (y + 5 * y + 2 * x) + offset[1];
        return [ex, ey];
    }

    static compute_iso_plates(plates, scale = 1, offset = [0, 0]) {
        function conversion(x, y) {
            return IsoBoard.compute_conversion(x, y, scale, offset);
        }
        let isoPlates = [];

        for (let plate of plates) {
            if (plate.plate_type === 1) {
                // Polygon
                let isoP = [];
                for (const [x, y] of plate.plate_xys) {
                    const ex = plate.plate_location[0] + x;
                    const ey = plate.plate_location[1] + y;
                    isoP.push(conversion(ex, ey));
                }
                isoPlates.push([1, plate.plate_color, isoP]);
            } else if (plate.plate_type === 2) {
                // Circle
                const [cx, cy] = plate.plate_location;
                const radius = plate.plate_xys[0][0];

                const A = conversion(cx - radius, cy - radius);
                const B = conversion(cx + radius, cy - radius);
                const C = conversion(cx - radius, cy + radius);
                const D = conversion(cx + radius, cy + radius);

                function bilinear_map(u, v) {
                    const x = (1 - u) * (1 - v) * A[0] + u * (1 - v) * B[0]
                            + (1 - u) * v * C[0] + u * v * D[0];
                    const y = (1 - u) * (1 - v) * A[1] + u * (1 - v) * B[1]
                            + (1 - u) * v * C[1] + u * v * D[1];
                    return [x, y];
                }

                let points = [];
                const resolution = 60;
                for (let i = 0; i < resolution; i++) {
                    const angle = 2 * Math.PI * i / resolution;
                    const u = 0.5 + 0.5 * Math.cos(angle);
                    const v = 0.5 + 0.5 * Math.sin(angle);
                    points.push(bilinear_map(u, v));
                }
                isoPlates.push([2, plate.plate_color, points]);
            }
        }
        return isoPlates;
    }

    // Blending is limited in canvas compared to numpy, but you can use globalAlpha and draw in order.
    // This version draws each polygon/circle in order; you can enhance with pixel-level blending later if needed.

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {[number, number]} blit_position
     */
    draw_board(ctx, blit_position = [0, 0]) {
        ctx.save();
        ctx.translate(blit_position[0], blit_position[1]);
        // For each isometric plate, draw its shape (polygon/circle)
        for (const plate of this.isoPlates) {
            if (plate[0] === 1) {
                // Polygon
                const coords = plate[2];
                ctx.beginPath();
                ctx.moveTo(coords[0][0], coords[0][1]);
                for (let i = 1; i < coords.length; i++) {
                    ctx.lineTo(coords[i][0], coords[i][1]);
                }
                ctx.closePath();
                ctx.fillStyle = plate[1];
                ctx.globalAlpha = 1.0; // Already using rgba with alpha
                ctx.fill();
            } else if (plate[0] === 2) {
                // Approximated circle as polygon
                const points = plate[2];
                ctx.beginPath();
                ctx.moveTo(points[0][0], points[0][1]);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i][0], points[i][1]);
                }
                ctx.closePath();
                ctx.fillStyle = plate[1];
                ctx.globalAlpha = 1.0;
                ctx.fill();
            }
        }
        ctx.restore();
    }

    draw_grid(ctx) {
        // Draw isometric grid (every 5 units)
        ctx.save();
        ctx.strokeStyle = LIGHT_GRID;
        ctx.lineWidth = 1;
        for (let x = 0; x <= 40; x += 5) {
            const p1 = IsoBoard.conversion(x, 0);
            const p2 = IsoBoard.conversion(x, 30);
            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();
        }
        for (let y = 0; y <= 30; y += 5) {
            const p1 = IsoBoard.conversion(0, y);
            const p2 = IsoBoard.conversion(40, y);
            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Helper for static grid
    static conversion(x, y) {
        return IsoBoard.compute_conversion(x, y, 1, [IsoBoard.startX, IsoBoard.startY]);
    }
}
