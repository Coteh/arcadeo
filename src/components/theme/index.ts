export {
    blendColors,
    getContrastingTextColor,
    rgbToHex,
    colorToRgb,
} from "./utils";

export interface ThemeDefinition {
    name: string;
    themeColor: string;
    apply?: () => void;
    teardown?: () => void;
}

export interface ThemeManagerOptions {
    themes: ThemeDefinition[];
    defaultTheme: string;
    targetElement?: HTMLElement;
}

export class ThemeManager {
    private currentTheme: string;
    private themes: Map<string, ThemeDefinition>;
    private targetElement: HTMLElement | null;

    constructor(options: ThemeManagerOptions) {
        this.themes = new Map();
        for (const theme of options.themes) {
            this.themes.set(theme.name, theme);
        }
        this.currentTheme = options.defaultTheme;
        this.targetElement = options.targetElement ?? null;
    }

    switchTheme(themeName: string): void {
        const target = this.targetElement ?? document.body;

        // Teardown current theme
        const current = this.themes.get(this.currentTheme);
        current?.teardown?.();

        // Remove old theme class, add new one
        target.classList.remove(this.currentTheme);
        const next = this.themes.get(themeName);
        if (!next) return;

        target.classList.add(themeName);
        this.currentTheme = themeName;

        // Update meta theme-color tag
        const metaTag = document.querySelector(
            "meta[name='theme-color']"
        ) as HTMLMetaElement | null;
        if (metaTag) {
            metaTag.content = next.themeColor;
        }

        // Apply new theme lifecycle hook
        next.apply?.();
    }

    getCurrentTheme(): string {
        return this.currentTheme;
    }

    getAvailableThemes(): string[] {
        return Array.from(this.themes.keys());
    }
}
