// level.js

// Assumes: constants.js, plate.js loaded

const IMAGE_FILENAMES = [
    "Heart.png",    // Level 1
    "Cloud.png",    // Level 2
    "Moon.png",     // Level 3
    "Youtube.png",  // Level 4
    "Target.png",   // Level 5
    "Map.png"       // Level 6
];

class Level {
    static level_names = ["Heart", "Cloud", "Moon", "YouTube", "Target", "Map"];

    // Key: level number; 1-based indexing
    static level_answer = {
        3: [
            [[0, 0], GREEND, [[7, 7]]],
            [[-3, 0], BLUED, [[10, 10]]]
        ],
        2: [
            [[0, 0], BLUED, [[0, 0], [12, 0], [12, 12], [0, 12]]],
            [[3, 12], REDD, [[3, 3]]],
            [[7, 12], REDD, [[5, 5]]]
        ],
        1: [
            [[0, 0], REDD, [[0, 0], [8, 8], [16, 0], [8, -8]]],
            [[4, -4], REDD, [[5.656854249492381, 5.656854249492381]]],
            [[12, -4], REDD, [[5.656854249492381, 5.656854249492381]]]
        ],
        5: [
            [[0, 0], BLUED, [[4, 4]]],
            [[0, 0], REDD, [[7, 7]]],
            [[0, 0], GREEND, [[10, 10]]]
        ],
        4: [
            [[0, 0], REDD, [[0, 0], [13, 0], [13, 10], [0, 10]]],
            [[4, 2], GREEND, [[0, 0], [5, 3], [0, 6]]],
            [[4, 2], BLUED, [[0, 0], [5, 3], [0, 6]]]
        ],
        6: [
            [[0, 0], BLUED, [[10, 10]]],
            [[-8, 6], BLUED, [[0, 0], [8, 8], [16, 0]]],
            [[0, 0], REDD, [[5.656854249492381, 5.656854249492381]]],
            [[0, 0], GREEND, [[5.656854249492381, 5.656854249492381]]]
        ]
    };

    static level_data = {
        1: [
            {type: 1, color: GRAY, location: [10, 10], xys: [[0,0],[8,8],[16,0],[8,-8]]},
            {type: 2, color: GRAY, location: [20, 20], xys: [[4*Math.SQRT2, 4*Math.SQRT2]]},
            {type: 2, color: GRAY, location: [15, 15], xys: [[4*Math.SQRT2, 4*Math.SQRT2]]}
        ],
        2: [
            {type: 1, color: GRAY, location: [5, 12],   xys: [[0,0],[12,0],[12,12],[0,12]]},
            {type: 2, color: GRAY, location: [20,10], xys: [[3,3]]},
            {type: 2, color: GRAY, location: [25,15], xys: [[5,5]]}
        ],
        3: [
            {type: 2, color: GRAY, location: [20,20], xys: [[7,7]]},
            {type: 2, color: GRAY, location: [15,15], xys: [[10,10]]}
        ],
        4: [
            {type: 1, color: GRAY, location: [5,5],   xys: [[0,0],[13,0],[13,10],[0,10]]},
            {type: 1, color: GRAY, location: [20,15], xys: [[0,0],[5,3],[0,6]]},
            {type: 1, color: GRAY, location: [10,20], xys: [[0,0],[5,3],[0,6]]}
        ],
        5: [
            {type: 2, color: GRAY, location: [30,20], xys: [[4,4]]},
            {type: 2, color: GRAY, location: [10,10], xys: [[7,7]]},
            {type: 2, color: GRAY, location: [20,15], xys: [[10,10]]}
        ],
        6: [
            {type: 1, color: GRAY, location: [17,5],  xys: [[0,0],[8,8],[16,0]]},
            {type: 2, color: GRAY, location: [20,19], xys: [[10,10]]},
            {type: 2, color: GRAY, location: [7,7],   xys: [[4*Math.SQRT2,4*Math.SQRT2]]},
            {type: 2, color: GRAY, location: [8,15],  xys: [[4*Math.SQRT2,4*Math.SQRT2]]}
        ]
    };

    /**
     * @param {number} level_id (1-based)
     */
    constructor(level_id) {
        this.level_id = level_id;
        this.plate_definitions = Level.level_data[level_id];
        this.answer = Level.level_answer[level_id];
        this.level_name = Level.level_names[level_id - 1];
        this.target = null; // Will be an Image object
        this.image_loaded = false;
        this.load_level_icon();
    }

    load(board) {
        board.plates = [];
        for (const spec of this.plate_definitions) {
            const plate = new Plate(
                spec.type,
                spec.color || GRAY,
                spec.location,
                spec.xys
            );
            board.add_plate(plate);
        }
    }

    load_level_icon() {
        // Preload the image (non-blocking)
        const filename = IMAGE_FILENAMES[this.level_id - 1];
        const img = new Image();
        img.src = "images/" + filename;
        img.onload = () => { this.image_loaded = true; };
        this.target = img;
    }

    /**
     * Draws the level icon (scaled and positioned) onto the canvas context.
     * @param {CanvasRenderingContext2D} ctx
     * @param {[number, number]} pos
     * @param {[number, number]} size
     */
    draw_level_icon(ctx, pos = [-90, -40], size = [300, 215]) {
        if (!this.target || !this.image_loaded) return;
        ctx.save();
        // Draw and scale
        ctx.drawImage(this.target, pos[0], pos[1], size[0], size[1]);
        ctx.restore();
    }
}
