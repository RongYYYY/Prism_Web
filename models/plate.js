// plate.js

// Make sure to import or include constants.js before this file!
// Uses: CELL_SIZE

class Plate {
    /**
     * @param {number} plateType - 1: polygon, 2: circle
     * @param {string} plateColor - CSS rgba color string
     * @param {[number, number]} plateLocation - [x, y] grid position
     * @param {Array<[number, number]>} plateXys - Relative polygon points OR [ [radius, 0] ] for circle
     */
    constructor(plateType, plateColor, plateLocation, plateXys) {
        this.plate_type = plateType;
        this.plate_color = plateColor;
        this.plate_location = plateLocation;
        this.plate_xys = plateXys;
        this.plate_coordinates = Array(plateXys.length).fill([0, 0]);
        // Rectangle for drag button (same size as Python)
        this.button_rect = { x: 0, y: 0, width: 10, height: 10 };
        this.dragging = false;
        this.xy_to_coordinates();
    }

    draw_plate(ctx, canvasWidth, canvasHeight) {
        // Draw on main canvas; temp_surface isn't needed in canvas (transparent by default)
        ctx.save();
        ctx.globalAlpha = 1.0; // Already using rgba with opacity for color

        if (this.plate_type === 1) {
            // Polygon
            ctx.beginPath();
            const coords = this.plate_coordinates;
            if (coords.length > 0) {
                ctx.moveTo(coords[0][0], coords[0][1]);
                for (let i = 1; i < coords.length; i++) {
                    ctx.lineTo(coords[i][0], coords[i][1]);
                }
                ctx.closePath();
                ctx.fillStyle = this.plate_color;
                ctx.fill();
            }
        } else if (this.plate_type === 2) {
            // Circle (center and radius)
            const centerX = (this.plate_location[0]) * CELL_SIZE + 100;
            const centerY = (this.plate_location[1]) * CELL_SIZE + 75;
            const radius = this.plate_xys[0][0] * CELL_SIZE;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = this.plate_color;
            ctx.fill();
        }
        ctx.restore();

        // Draw button (black rectangle for dragging handle)
        ctx.save();
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.button_rect.x, this.button_rect.y, this.button_rect.width, this.button_rect.height);
        ctx.restore();
    }

    xy_to_coordinates() {
        // Converts relative xys to absolute pixel positions
        this.plate_coordinates = this.plate_xys.map(([x, y]) => [
            (x + this.plate_location[0]) * CELL_SIZE + 100,
            (y + this.plate_location[1]) * CELL_SIZE + 75
        ]);
        this.update_button_position();
    }

    update_button_position() {
        // Updates position for drag handle (centered over shape location)
        this.button_rect.x = this.plate_location[0] * CELL_SIZE + 100 - 5;
        this.button_rect.y = this.plate_location[1] * CELL_SIZE + 75 - 5;
    }

    // Collision test for mouse on handle
    isPointInButton(mx, my) {
        return (
            mx >= this.button_rect.x &&
            mx <= this.button_rect.x + this.button_rect.width &&
            my >= this.button_rect.y &&
            my <= this.button_rect.y + this.button_rect.height
        );
    }
}
