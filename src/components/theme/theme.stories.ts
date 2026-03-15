import type { Meta, StoryObj } from "@storybook/html";
import { ThemeManager } from ".";

const meta: Meta = {
    title: "Components/Theme",
};

export default meta;
type Story = StoryObj;

export const ThemeSwitching: Story = {
    render: () => {
        const container = document.createElement("div");
        container.style.padding = "20px";

        const preview = document.createElement("div");
        preview.style.width = "300px";
        preview.style.height = "200px";
        preview.style.borderRadius = "8px";
        preview.style.display = "flex";
        preview.style.alignItems = "center";
        preview.style.justifyContent = "center";
        preview.style.fontSize = "18px";
        preview.style.transition = "all 0.3s";
        preview.style.backgroundColor = "#1a1a2e";
        preview.style.color = "#eee";
        preview.textContent = "dark";

        const themeManager = new ThemeManager({
            themes: [
                { name: "dark", themeColor: "#1a1a2e" },
                { name: "light", themeColor: "#ffffff" },
                {
                    name: "ocean",
                    themeColor: "#0a3d62",
                    apply: () => {
                        preview.style.backgroundColor = "#0a3d62";
                        preview.style.color = "#eee";
                    },
                    teardown: () => {},
                },
            ],
            defaultTheme: "dark",
            targetElement: preview,
        });

        const buttons = document.createElement("div");
        buttons.style.marginTop = "12px";
        buttons.style.display = "flex";
        buttons.style.gap = "8px";

        for (const theme of themeManager.getAvailableThemes()) {
            const btn = document.createElement("button");
            btn.textContent = theme;
            btn.addEventListener("click", () => {
                themeManager.switchTheme(theme);
                preview.textContent = theme;
                if (theme === "dark") {
                    preview.style.backgroundColor = "#1a1a2e";
                    preview.style.color = "#eee";
                } else if (theme === "light") {
                    preview.style.backgroundColor = "#ffffff";
                    preview.style.color = "#333";
                }
            });
            buttons.appendChild(btn);
        }

        container.appendChild(preview);
        container.appendChild(buttons);

        return container;
    },
};
