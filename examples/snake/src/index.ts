import { makeSwipeable } from "arcadeo/components/swipeable";
import { ThemeManager } from "arcadeo/components/theme";
import type { IGameState, IGamePersistentState } from "arcadeo/components/game";
import { BrowserGameStorage } from "arcadeo/components/storage/browser";

// ── Types ───────────────────────────────────────────

type Direction = "up" | "down" | "left" | "right";

interface Position {
    x: number;
    y: number;
}

interface SnakeGameState extends IGameState {
    snake: Position[];
    food: Position;
    direction: Direction;
    nextDirection: Direction;
    score: number;
    ended: boolean;
}

interface SnakePersistentState extends IGamePersistentState {
    highscore: number;
    theme: string;
}

// ── Constants ───────────────────────────────────────

const GRID_SIZE = 16;
const TICK_MS = 120;

const OPPOSITE: Record<Direction, Direction> = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
};

const DELTA: Record<Direction, Position> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
};

// ── Storage ─────────────────────────────────────────

const storage = new BrowserGameStorage();
const PERSISTENT_KEY = "snk_persistent";

function loadPersistent(): SnakePersistentState {
    const state = storage.loadState<Partial<SnakePersistentState>>(PERSISTENT_KEY);
    return {
        highscore: state.highscore ?? 0,
        theme: state.theme ?? "dark",
    };
}

function savePersistent(state: SnakePersistentState): void {
    storage.saveState(PERSISTENT_KEY, state);
}

// ── Theme ───────────────────────────────────────────

const themeManager = new ThemeManager({
    themes: [
        { name: "dark", themeColor: "#0f0f0f" },
        { name: "light", themeColor: "#f5f5f5" },
    ],
    defaultTheme: "dark",
});

// ── DOM refs ────────────────────────────────────────

const boardEl = document.getElementById("board")!;
const scoreEl = document.getElementById("score")!;
const highscoreEl = document.getElementById("highscore")!;
const overlayEl = document.getElementById("overlay")!;
const overlayTitle = document.getElementById("overlay-title")!;
const overlayScore = document.getElementById("overlay-score")!;
const restartBtn = document.getElementById("restart-btn")!;
const themeToggle = document.getElementById("theme-toggle")!;

// ── Build grid cells ────────────────────────────────

const cells: HTMLDivElement[][] = [];

for (let y = 0; y < GRID_SIZE; y++) {
    cells[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        boardEl.appendChild(cell);
        cells[y][x] = cell;
    }
}

// ── Game state ──────────────────────────────────────

let persistent = loadPersistent();
let game: SnakeGameState;
let tickTimer: number;

function newGame(): SnakeGameState {
    const center = Math.floor(GRID_SIZE / 2);
    return {
        snake: [
            { x: center, y: center },
            { x: center - 1, y: center },
            { x: center - 2, y: center },
        ],
        food: spawnFood([
            { x: center, y: center },
            { x: center - 1, y: center },
            { x: center - 2, y: center },
        ]),
        direction: "right",
        nextDirection: "right",
        score: 0,
        ended: false,
    };
}

function spawnFood(snake: Position[]): Position {
    const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
    const free: Position[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (!occupied.has(`${x},${y}`)) {
                free.push({ x, y });
            }
        }
    }
    return free[Math.floor(Math.random() * free.length)];
}

// ── Game loop ───────────────────────────────────────

function tick(): void {
    if (game.ended) return;

    game.direction = game.nextDirection;
    const head = game.snake[0];
    const delta = DELTA[game.direction];
    const next: Position = {
        x: head.x + delta.x,
        y: head.y + delta.y,
    };

    // Wall collision
    if (next.x < 0 || next.x >= GRID_SIZE || next.y < 0 || next.y >= GRID_SIZE) {
        endGame();
        return;
    }

    // Self collision
    if (game.snake.some((s) => s.x === next.x && s.y === next.y)) {
        endGame();
        return;
    }

    game.snake.unshift(next);

    // Food collision
    if (next.x === game.food.x && next.y === game.food.y) {
        game.score++;
        game.food = spawnFood(game.snake);
    } else {
        game.snake.pop();
    }

    render();
}

function endGame(): void {
    game.ended = true;
    clearInterval(tickTimer);

    if (game.score > persistent.highscore) {
        persistent.highscore = game.score;
        savePersistent(persistent);
    }

    highscoreEl.textContent = persistent.highscore.toString();
    overlayTitle.textContent = game.score > 0 && game.score === persistent.highscore
        ? "New Best!"
        : "Game Over";
    overlayScore.textContent = `Score: ${game.score}`;
    overlayEl.classList.remove("hidden");
}

function startGame(): void {
    overlayEl.classList.add("hidden");
    game = newGame();
    render();
    clearInterval(tickTimer);
    tickTimer = window.setInterval(tick, TICK_MS);
}

// ── Rendering ───────────────────────────────────────

function render(): void {
    // Clear all cells
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            cells[y][x].className = "cell";
        }
    }

    // Draw food
    cells[game.food.y][game.food.x].classList.add("food");

    // Draw snake
    game.snake.forEach((pos, i) => {
        cells[pos.y][pos.x].classList.add(i === 0 ? "snake-head" : "snake-body");
    });

    scoreEl.textContent = game.score.toString();
}

// ── Input: Keyboard ─────────────────────────────────

const KEY_MAP: Record<string, Direction> = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
    W: "up",
    S: "down",
    A: "left",
    D: "right",
};

document.addEventListener("keydown", (e) => {
    const dir = KEY_MAP[e.key];
    if (!dir) return;
    e.preventDefault();

    if (game.ended) {
        startGame();
        return;
    }

    if (dir !== OPPOSITE[game.direction]) {
        game.nextDirection = dir;
    }
});

// ── Input: Swipe ────────────────────────────────────

makeSwipeable(document.body, {
    sensitivity: 30,
    preventDefault: true,
    onSwipe: (dir) => {
        if (game.ended) {
            startGame();
            return;
        }

        if (dir !== OPPOSITE[game.direction]) {
            game.nextDirection = dir;
        }
    },
});

// ── Theme toggle ────────────────────────────────────

function applyTheme(themeName: string): void {
    themeManager.switchTheme(themeName);
    persistent.theme = themeName;
    savePersistent(persistent);
}

themeToggle.addEventListener("click", () => {
    const next = themeManager.getCurrentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
});

// ── Restart button ──────────────────────────────────

restartBtn.addEventListener("click", startGame);

// ── Init ────────────────────────────────────────────

applyTheme(persistent.theme);
highscoreEl.textContent = persistent.highscore.toString();
game = newGame();
render();
tickTimer = window.setInterval(tick, TICK_MS);
