// board.js

// Assumes constants.js and plate.js are loaded first!

class Board {
    constructor() {
        this.le = 40; // number of columns
        this.he = 30; // number of rows
        this.plates = [];
        this.boardStartX = 100;
        this.boardStartY = 60;
        this.width = 600;
        this.height = 450;
        this.cellWidth = CELL_SIZE;
    }

    draw_grid(ctx) {
        // Vertical grid lines
        for (let x = 0; x <= this.le; x++) {
            ctx.beginPath();
            ctx.strokeStyle = LIGHT_GRID;
            ctx.moveTo(this.boardStartX + x * this.cellWidth, this.boardStartY);
            ctx.lineTo(this.boardStartX + x * this.cellWidth, this.height + this.boardStartY);
            ctx.stroke();
        }
        // Horizontal grid lines
        for (let y = 0; y <= this.he; y++) {
            ctx.beginPath();
            ctx.strokeStyle = LIGHT_GRID;
            ctx.moveTo(this.boardStartX, this.boardStartY + y * this.cellWidth);
            ctx.lineTo(this.boardStartX + this.width, this.boardStartY + y * this.cellWidth);
            ctx.stroke();
        }
    }

    draw_board(ctx) {
        for (const plate of this.plates) {
            plate.draw_plate(ctx);
        }
    }

    /**
     * Get the topmost plate at a given position.
     * @param {[number, number]} pos - [mouseX, mouseY]
     * @returns {Plate|null}
     */
    get_plate_at(pos) {
        // Check from topmost to bottom-most (reverse order)
        for (let i = this.plates.length - 1; i >= 0; i--) {
            if (this.plates[i].isPointInButton(pos[0], pos[1])) {
                return this.plates[i];
            }
        }
        return null;
    }

    add_plate(plate) {
        this.plates.push(plate);
    }

    bring_to_top(plate) {
        const idx = this.plates.indexOf(plate);
        if (idx !== -1) {
            this.plates.splice(idx, 1);
            this.plates.push(plate);
        }
    }
}
