/**
 * Blend two colors together based on alpha transparency
 * @param topColor - The top color in rgb/rgba format
 * @param bottomColor - The bottom color in rgb/rgba format
 * @param alpha - The alpha value of the top color (0-1)
 * @returns The blended color in rgb format
 */
export function blendColors(
    topColor: string,
    bottomColor: string,
    alpha: number
): string {
    const topMatch = topColor.match(/\d+/g);
    const bottomMatch = bottomColor.match(/\d+/g);

    if (!topMatch || !bottomMatch) {
        return bottomColor;
    }

    const top = topMatch.map(Number);
    const bottom = bottomMatch.map(Number);

    const r = Math.round(alpha * top[0] + (1 - alpha) * bottom[0]);
    const g = Math.round(alpha * top[1] + (1 - alpha) * bottom[1]);
    const b = Math.round(alpha * top[2] + (1 - alpha) * bottom[2]);

    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Calculate the best contrasting text color (black or white) for a given background
 * Uses WCAG contrast ratio formula
 * @param backgroundColor - Background color in hex format (e.g., '#BBBBBB')
 * @returns Either '#000000' or '#FFFFFF'
 */
export function getContrastingTextColor(backgroundColor: string): string {
    let hex = backgroundColor.replace(/^#/, "");

    if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
        hex = "000000";
    }

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const rsRGB =
        r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gsRGB =
        g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bsRGB =
        b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    const luminance = 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;

    const contrastWithWhite = 1.05 / (luminance + 0.05);
    const contrastWithBlack = (luminance + 0.05) / 0.05;

    return contrastWithWhite >= contrastWithBlack ? "#FFFFFF" : "#000000";
}

/**
 * Convert rgb color string to hex format
 * @param rgb - Color in rgb format (e.g., "rgb(0, 0, 0)")
 * @returns Color in hex format (e.g., "#000000")
 */
export function rgbToHex(rgb: string): string {
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) {
        return "#000000";
    }

    const values = match.map(Number);
    const r = values[0].toString(16).padStart(2, "0");
    const g = values[1].toString(16).padStart(2, "0");
    const b = values[2].toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
}

/**
 * Convert a color string to RGB format using a canvas element
 * @param color - Color string (hex, named color, or rgb)
 * @returns Color in RGB format
 */
export function colorToRgb(color: string): string {
    if (color.startsWith("rgb")) {
        return color;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return color;
    }
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`;
}
