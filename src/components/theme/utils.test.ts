import {
    blendColors,
    getContrastingTextColor,
    rgbToHex,
} from "./utils";

describe("blendColors", () => {
    it("should blend two colors at 50% alpha", () => {
        const result = blendColors("rgb(255, 0, 0)", "rgb(0, 0, 255)", 0.5);
        expect(result).toBe("rgb(128, 0, 128)");
    });

    it("should return top color at full alpha", () => {
        const result = blendColors("rgb(255, 0, 0)", "rgb(0, 0, 255)", 1);
        expect(result).toBe("rgb(255, 0, 0)");
    });

    it("should return bottom color at zero alpha", () => {
        const result = blendColors("rgb(255, 0, 0)", "rgb(0, 0, 255)", 0);
        expect(result).toBe("rgb(0, 0, 255)");
    });

    it("should return bottom color for invalid top color", () => {
        const result = blendColors("invalid", "rgb(0, 0, 255)", 0.5);
        expect(result).toBe("rgb(0, 0, 255)");
    });
});

describe("getContrastingTextColor", () => {
    it("should return white for dark backgrounds", () => {
        expect(getContrastingTextColor("#000000")).toBe("#FFFFFF");
        expect(getContrastingTextColor("#333333")).toBe("#FFFFFF");
    });

    it("should return black for light backgrounds", () => {
        expect(getContrastingTextColor("#FFFFFF")).toBe("#000000");
        expect(getContrastingTextColor("#CCCCCC")).toBe("#000000");
    });

    it("should handle invalid hex gracefully", () => {
        expect(getContrastingTextColor("invalid")).toBe("#FFFFFF");
    });
});

describe("rgbToHex", () => {
    it("should convert rgb to hex", () => {
        expect(rgbToHex("rgb(0, 0, 0)")).toBe("#000000");
        expect(rgbToHex("rgb(255, 255, 255)")).toBe("#ffffff");
        expect(rgbToHex("rgb(187, 187, 187)")).toBe("#bbbbbb");
    });

    it("should return black for invalid input", () => {
        expect(rgbToHex("invalid")).toBe("#000000");
    });
});
