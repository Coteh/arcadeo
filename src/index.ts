// Game state interfaces
export type {
    IGameState,
    IGamePersistentState,
    IGamePreferences,
} from "./components/game";

// Storage
export type { IGameStorage } from "./components/storage";
export { BrowserGameStorage } from "./components/storage/browser";
export { CLIGameStorage } from "./components/storage/cli";

// Preferences
export {
    Preferences,
    initPreferences,
    getPreferenceValue,
    savePreferenceValue,
    resetPreferences,
} from "./components/preferences";

// Knob
export { createKnob } from "./components/knob";
export type { KnobOptions } from "./components/knob";

// Grid
export { Grid } from "./components/grid";

// Draggable
export { makeDraggable } from "./components/draggable";
export type { DragOptions } from "./components/draggable";

// Swipeable
export { makeSwipeable } from "./components/swipeable";
export type { SwipeDirection, SwipeOptions } from "./components/swipeable";

// Theme
export { ThemeManager } from "./components/theme";
export type {
    ThemeDefinition,
    ThemeManagerOptions,
} from "./components/theme";
export {
    blendColors,
    getContrastingTextColor,
    rgbToHex,
    colorToRgb,
} from "./components/theme";
