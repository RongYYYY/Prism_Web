// main.js

// ==== Initialize Canvas & Globals ====
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// === Constants & State ===
const FONT_FAMILY = "Courier New";
const FONT = `48px ${FONT_FAMILY}`;
const BUTTON_FONT = `32px ${FONT_FAMILY}`;

const WHITE = additive_blend([
  [239, 72, 60, 160],
  [25, 115, 23, 160],
  [25, 115, 192, 160]
]); // Same as additive_blend([REDD,GREEND,BLUED])
// If you want: const WHITE = additive_blend([REDD, GREEND, BLUED]);

const color_buttons = [
  { color: REDD, rect: { x: 720, y: 150, w: 50, h: 50 } },
  { color: GREEND, rect: { x: 720, y: 250, w: 50, h: 50 } },
  { color: BLUED, rect: { x: 720, y: 350, w: 50, h: 50 } },
];

// === Load Assets ===
const assetPaths = {
  start: "images/start.jpg",
  instruction: "images/instruction.png",
  bg: "images/bg.png",
  home: "images/home.png",
};
let assets = {};
let loadedAssets = 0;
let assetsToLoad = Object.keys(assetPaths).length;

for (const [key, path] of Object.entries(assetPaths)) {
  assets[key] = new Image();
  assets[key].src = path;
  assets[key].onload = () => {
    loadedAssets++;
  };
}

let home_icon_rect = { x: 20, y: 20, w: 40, h: 40 };

// === State Variables ===
let selected_color = null;
let selected_plate = null;
let show_isometric = false;
let show_start_screen = true;
let show_instruction_screen = false;
let show_result_screen = false;
let show_level_select = true;
let result_text = "";
let button_text = "";
let current_level = null;
let board = new Board();
let level = null;
let level_completed = [];

// === Level Selection Layout ===
const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 60;
const LEVEL_COLS = 3;
const LEVEL_ROWS = 2;
const margin_x = 80;
const spacing_x =
  (SCREEN_WIDTH - 2 * margin_x - LEVEL_COLS * BUTTON_WIDTH) /
  (LEVEL_COLS - 1);
const margin_y = 250;
const spacing_y = 40;
let level_buttons = [];
for (let lvl = 1; lvl <= LEVEL_COLS * LEVEL_ROWS; lvl++) {
  let idx = lvl - 1;
  let row = Math.floor(idx / LEVEL_COLS);
  let col = idx % LEVEL_COLS;
  let x = margin_x + col * (BUTTON_WIDTH + spacing_x);
  let y = margin_y + row * (BUTTON_HEIGHT + spacing_y);
  level_buttons.push({
    lvl: lvl,
    rect: { x: x, y: y, w: BUTTON_WIDTH, h: BUTTON_HEIGHT },
  });
}

// === Instruction and Result Navigation ===
const home_button = {
  x: SCREEN_WIDTH / 2 - 75,
  y: SCREEN_HEIGHT / 2 + 160,
  w: 150,
  h: 50,
};
const enter_text_rect = {
  x: SCREEN_WIDTH / 2 - 100,
  y: SCREEN_HEIGHT - 100,
  w: 200,
  h: 40,
};
const next_text_rect = {
  x: SCREEN_WIDTH - 150,
  y: SCREEN_HEIGHT - 60,
  w: 120,
  h: 40,
};
const back_text_rect = {
  x: 50,
  y: SCREEN_HEIGHT - 60,
  w: 120,
  h: 40,
};

// ==== Utility ====
function pointInRect(pos, rect) {
  return (
    pos.x >= rect.x &&
    pos.x <= rect.x + rect.w &&
    pos.y >= rect.y &&
    pos.y <= rect.y + rect.h
  );
}

// ==== Helpers ====
function draw_color_buttons() {
  for (const { color, rect } of color_buttons) {
    ctx.fillStyle = color;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    if (selected_color === color) {
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 4;
      ctx.strokeRect(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4);
    }
  }
}

// ==== Answer Check Logic ====
function check_answer(board, current_level) {
  const answer = Level.level_answer[current_level];
  const initial = answer[0][2];
  let ini = [0, 0];
  for (const plate of board.plates) {
    if (JSON.stringify(plate.plate_xys) === JSON.stringify(initial)) {
      ini = plate.plate_location;
    }
  }
  for (const plate of board.plates) {
    let curr = false;
    for (const [loc, color, xys] of answer) {
      if (JSON.stringify(xys) === JSON.stringify(plate.plate_xys)) {
        if (
          color === plate.plate_color &&
          loc[0] === plate.plate_location[0] - ini[0] &&
          loc[1] === plate.plate_location[1] - ini[1]
        ) {
          curr = true;
        }
      }
    }
    if (!curr) {
      return false;
    }
  }
  if (!level_completed.includes(current_level)) level_completed.push(current_level);
  return true;
}

// ==== Main Game Loop ====
function draw() {
  // Wait for images
  if (loadedAssets < assetsToLoad) {
    requestAnimationFrame(draw);
    return;
  }

  // === Drawing ===
  if (show_start_screen) {
    ctx.drawImage(assets.start, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.font = BUTTON_FONT;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(
      "Enter the Game",
      enter_text_rect.x + enter_text_rect.w / 2,
      enter_text_rect.y + enter_text_rect.h / 2 + 14
    );
  } else if (show_instruction_screen) {
    ctx.drawImage(assets.instruction, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.font = BUTTON_FONT;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(
      "Next>",
      next_text_rect.x + next_text_rect.w / 2,
      next_text_rect.y + next_text_rect.h / 2 + 14
    );
    ctx.fillText(
      "<Back",
      back_text_rect.x + back_text_rect.w / 2,
      back_text_rect.y + back_text_rect.h / 2 + 14
    );
  } else if (show_level_select) {
    ctx.drawImage(assets.bg, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.font = FONT;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Select Level", SCREEN_WIDTH / 2, 150);
    for (const { lvl, rect } of level_buttons) {
      ctx.fillStyle = level_completed.includes(lvl)
        ? "rgb(160,160,160)"
        : LIGHT_GRID;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

      ctx.font = "24px " + FONT_FAMILY;
      ctx.fillStyle = "#000";
      ctx.fillText(
        Level.level_names[lvl - 1],
        rect.x + rect.w / 2,
        rect.y + rect.h / 2 + 9
      );
    }
    ctx.font = BUTTON_FONT;
    ctx.fillStyle = "#fff";
    ctx.fillText(
      "<Back",
      back_text_rect.x + back_text_rect.w / 2,
      back_text_rect.y + back_text_rect.h / 2 + 14
    );
  } else if (show_result_screen) {
    ctx.drawImage(assets.bg, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    if (level) level.draw_level_icon(ctx, [160, 60], [480, 360]);
    ctx.font = FONT;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(
      result_text,
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2 + 100
    );
    ctx.fillStyle = LIGHT_GRID;
    ctx.fillRect(home_button.x, home_button.y, home_button.w, home_button.h);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(home_button.x, home_button.y, home_button.w, home_button.h);

    ctx.font = BUTTON_FONT;
    ctx.fillStyle = "#000";
    ctx.fillText(
      button_text,
      home_button.x + home_button.w / 2,
      home_button.y + home_button.h / 2 + 14
    );
    ctx.drawImage(assets.home, home_icon_rect.x, home_icon_rect.y, home_icon_rect.w, home_icon_rect.h);
  } else {
    // In-game
    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.drawImage(assets.home, home_icon_rect.x, home_icon_rect.y, home_icon_rect.w, home_icon_rect.h);

    if (show_isometric) {
      ctx.drawImage(assets.bg, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      let iso_board = new IsoBoard(board.plates);
      let iso_proj = new IsoProjection(board.plates, 1.8, [400, 0]);
      iso_proj.draw_projection(ctx, [0, 0]);
      iso_board.draw_grid(ctx);
      iso_board.draw_board(ctx);
      ctx.font = "24px " + FONT_FAMILY;
      ctx.fillStyle = "#fff";
      ctx.fillText(
        "SPACE: Toggle view | ENTER: Check solution",
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT - 50
      );
      if (level) level.draw_level_icon(ctx, [-60, -30]);
      ctx.font = "18px " + FONT_FAMILY;
      ctx.fillText("Target Shape", 90, 20);
    } else {
      board.draw_grid(ctx);
      board.draw_board(ctx);
      draw_color_buttons();
      ctx.font = "24px " + FONT_FAMILY;
      ctx.fillStyle = "#000";
      ctx.fillText(
        "SPACE: Toggle view | ENTER: Check solution",
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT - 50
      );
      ctx.font = "16px " + FONT_FAMILY;
      ctx.fillStyle = "#000";
      let instrText = selected_color
        ? `Drag controller to move shape | Click controller to color ${
            selected_color === REDD
              ? "Red"
              : selected_color === GREEND
              ? "Green"
              : "Blue"
          }`
        : "Drag controller to move shape | Select color to assign";
      ctx.fillText(instrText, SCREEN_WIDTH / 2 + 70, 40);
    }
  }
  requestAnimationFrame(draw);
}

// ==== Mouse & Keyboard Handling ====
// Helper: get mouse position relative to canvas
function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

// Clicks & Drags
let mouseIsDown = false;

canvas.addEventListener("mousedown", function (evt) {
  const pos = getMousePos(evt);

  // Screens
  if (show_start_screen) {
    if (pointInRect(pos, enter_text_rect)) {
      show_start_screen = false;
      show_instruction_screen = true;
      return;
    }
  } else if (show_instruction_screen) {
    if (pointInRect(pos, next_text_rect)) {
      show_instruction_screen = false;
      show_level_select = true;
      return;
    }
    if (pointInRect(pos, back_text_rect)) {
      show_instruction_screen = false;
      show_start_screen = true;
      return;
    }
  } else if (show_level_select) {
    for (const { lvl, rect } of level_buttons) {
      if (pointInRect(pos, rect)) {
        current_level = lvl;
        level = new Level(current_level);
        level.load(board);
        show_level_select = false;
        show_result_screen = true;
        result_text = level.level_name;
        button_text = "Start";
        return;
      }
    }
    if (pointInRect(pos, back_text_rect)) {
      show_level_select = false;
      show_instruction_screen = true;
      return;
    }
  } else if (pointInRect(pos, home_icon_rect)) {
    show_level_select = true;
    show_result_screen = false;
    show_isometric = false;
    return;
  } else if (show_result_screen) {
    if (pointInRect(pos, home_button)) {
      show_result_screen = false;
      if (check_answer(board, current_level)) {
        show_level_select = true;
      }
      return;
    }
  } else {
    // In-game mouse
    for (const { color, rect } of color_buttons) {
      if (
        pos.x >= rect.x &&
        pos.x <= rect.x + rect.w &&
        pos.y >= rect.y &&
        pos.y <= rect.y + rect.h
      ) {
        selected_color = color;
        return;
      }
    }

    selected_plate = board.get_plate_at([pos.x, pos.y]);
    if (selected_plate) {
      if (selected_color) {
        selected_plate.plate_color = selected_color;
        selected_color = null;
      } else {
        selected_plate.dragging = true;
        board.bring_to_top(selected_plate);
      }
      mouseIsDown = true;
    }
  }
});

canvas.addEventListener("mouseup", function (evt) {
  if (selected_plate) {
    const pos = getMousePos(evt);
    let x = Math.round((pos.x - 100) / 15);
    let y = Math.round((pos.y - 75) / 15);
    selected_plate.plate_location = [x, y];
    selected_plate.xy_to_coordinates();
    selected_plate.dragging = false;
    selected_plate = null;
  }
  mouseIsDown = false;
});

canvas.addEventListener("mousemove", function (evt) {
  if (selected_plate && selected_plate.dragging) {
    const pos = getMousePos(evt);
    let x = (pos.x - 100) / 15;
    let y = (pos.y - 75) / 15;
    selected_plate.plate_location = [x, y];
    selected_plate.xy_to_coordinates();
  }
});

// Keyboard
window.addEventListener("keydown", function (evt) {
  if (evt.code === "Space") {
    show_isometric = !show_isometric;
  } else if (evt.code === "Enter" || evt.code === "NumpadEnter") {
    show_result_screen = true;
    let win = check_answer(board, current_level);
    result_text = win ? "Win :D" : "Try again :(";
    button_text = win ? "Home" : "Back";
  }
});

// ==== Start Game Loop ====
draw();
