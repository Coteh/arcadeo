/**
 * The files a new game starts as. Components are copied in separately, so a
 * scaffolded game has no runtime dependency on the arcadeo package: the
 * `arcadeo/*` specifier is an alias onto its own src/, which keeps generated
 * game code reading the same as the examples in this repo.
 */

export interface ScaffoldOptions {
    /** Package name, and the <title> of the page. */
    name: string;
    title: string;
    srcDir: string;
}

export function packageJson(o: ScaffoldOptions): string {
    return (
        JSON.stringify(
            {
                name: o.name,
                private: true,
                type: "module",
                scripts: {
                    dev: "vite",
                    build: "vite build",
                    preview: "vite preview",
                },
                devDependencies: {
                    typescript: "^5.7.3",
                    "@types/node": "^22.10.2",
                    vite: "^6.0.5",
                },
            },
            null,
            2
        ) + "\n"
    );
}

export function tsconfigJson(): string {
    return (
        JSON.stringify(
            {
                compilerOptions: {
                    target: "ES2020",
                    module: "ESNext",
                    lib: ["ES2020", "DOM", "DOM.Iterable"],
                    moduleResolution: "bundler",
                    allowImportingTsExtensions: true,
                    isolatedModules: true,
                    noEmit: true,
                    strict: true,
                    paths: { "arcadeo/*": ["./src/*"] },
                },
                include: ["src"],
            },
            null,
            2
        ) + "\n"
    );
}

// fileURLToPath rather than __dirname: the scaffold is ESM, like this CLI.
export function viteConfig(): string {
    return `import { defineConfig } from "vite";
import { fileURLToPath } from "url";

export default defineConfig({
    server: {
        host: true,
    },
    resolve: {
        alias: {
            arcadeo: fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
`;
}

export function indexHtml(o: ScaffoldOptions): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#0f0f0f" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <title>${escapeHtml(o.title)}</title>
    <link rel="stylesheet" href="/src/style.css" />
</head>
<body>
    <div id="app">
        <header>
            <div class="header-row">
                <h1>${escapeHtml(o.title)}</h1>
                <button id="theme-toggle" aria-label="Toggle theme"></button>
            </div>
            <div class="score-row">
                <div class="score-block">
                    <span class="score-label">Score</span>
                    <span id="score">0</span>
                </div>
                <div class="score-block">
                    <span class="score-label">Best</span>
                    <span id="highscore">0</span>
                </div>
            </div>
        </header>
        <div id="board"></div>
        <div id="overlay" class="hidden">
            <div id="overlay-content">
                <h2 id="overlay-title">Game Over</h2>
                <p id="overlay-score"></p>
                <button id="restart-btn">Play Again</button>
            </div>
        </div>
        <footer>
            <p class="hint">Arrow keys or WASD to move</p>
        </footer>
    </div>
    <script type="module" src="/src/index.ts"></script>
</body>
</html>
`;
}

export function indexTs(): string {
    return `import { ThemeManager } from "arcadeo/components/theme";
import { BrowserGameStorage } from "arcadeo/components/storage/browser";

// The scaffold wires up the parts every game here needs — theme, a score that
// survives a reload, a game-over overlay — and leaves the game itself to you.

const PERSISTENT_KEY = "game-state";

const boardEl = document.getElementById("board")!;
const scoreEl = document.getElementById("score")!;
const highscoreEl = document.getElementById("highscore")!;
const overlayEl = document.getElementById("overlay")!;
const overlayScoreEl = document.getElementById("overlay-score")!;
const restartBtn = document.getElementById("restart-btn")!;
const themeToggle = document.getElementById("theme-toggle")!;

const themeManager = new ThemeManager({
    themes: [
        { name: "dark", themeColor: "#0f0f0f" },
        { name: "light", themeColor: "#f5f5f5" },
    ],
    defaultTheme: "dark",
});

themeToggle.addEventListener("click", () => {
    const next = themeManager.getCurrentTheme() === "dark" ? "light" : "dark";
    themeManager.switchTheme(next);
});

const storage = new BrowserGameStorage();

interface PersistentState {
    highscore: number;
}

function loadHighscore(): number {
    const state = storage.loadState<Partial<PersistentState>>(PERSISTENT_KEY);
    return state?.highscore ?? 0;
}

function saveHighscore(highscore: number): void {
    storage.saveState<PersistentState>(PERSISTENT_KEY, { highscore });
}

let score = 0;
let highscore = loadHighscore();

function render(): void {
    scoreEl.textContent = String(score);
    highscoreEl.textContent = String(highscore);
}

/** Call this when the run ends. */
export function gameOver(): void {
    if (score > highscore) {
        highscore = score;
        saveHighscore(highscore);
    }
    overlayScoreEl.textContent = \`You scored \${score}\`;
    overlayEl.classList.remove("hidden");
    render();
}

/** Call this to add to the score as the player earns it. */
export function addScore(points: number): void {
    score += points;
    render();
}

function start(): void {
    score = 0;
    overlayEl.classList.add("hidden");
    boardEl.replaceChildren();
    render();

    // Your game goes here.
}

restartBtn.addEventListener("click", start);
start();
`;
}

export function styleCss(): string {
    return `:root {
    --bg: #f4f4f5;
    --fg: #101014;
    --muted: #6b7280;
    --surface: #ffffff;
    --line: #d4d4d8;
    --accent: #2b4c7e;
}

[data-theme="dark"] {
    --bg: #0f0f0f;
    --fg: #ededf0;
    --muted: #9aa0a6;
    --surface: #1a1a1d;
    --line: #2e2e33;
    --accent: #7aa2d6;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: var(--bg);
    color: var(--fg);
    font: 16px/1.5 system-ui, -apple-system, sans-serif;
    transition: background 0.2s, color 0.2s;
}

#app {
    width: min(100vw - 2rem, 30rem);
    padding: 1rem 0 2rem;
}

.header-row,
.score-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

h1 {
    margin: 0;
    font-size: 1.5rem;
}

#theme-toggle {
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    color: inherit;
    cursor: pointer;
}

.score-block {
    display: flex;
    flex-direction: column;
}

.score-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
}

#board {
    margin: 1rem 0;
    aspect-ratio: 1;
    border: 1px solid var(--line);
    border-radius: 0.75rem;
    background: var(--surface);
}

#overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.55);
}

#overlay.hidden {
    display: none;
}

#overlay-content {
    padding: 1.5rem 2rem;
    border-radius: 0.75rem;
    background: var(--surface);
    text-align: center;
}

#restart-btn {
    margin-top: 0.5rem;
    padding: 0.5rem 1.25rem;
    border: 0;
    border-radius: 0.5rem;
    background: var(--accent);
    color: #fff;
    font: inherit;
    cursor: pointer;
}

.hint {
    color: var(--muted);
    font-size: 0.875rem;
    text-align: center;
}
`;
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
