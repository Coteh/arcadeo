import type { Meta, StoryObj } from "@storybook/html";
import { makeSwipeable } from ".";

const meta: Meta = {
    title: "Components/Swipeable",
};

export default meta;
type Story = StoryObj;

export const SwipeDetection: Story = {
    render: () => {
        const container = document.createElement("div");
        container.style.width = "300px";
        container.style.height = "300px";
        container.style.border = "2px dashed #ccc";
        container.style.borderRadius = "8px";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.userSelect = "none";

        const label = document.createElement("div");
        label.style.fontSize = "14px";
        label.style.color = "#888";
        label.textContent = "Swipe here (touch device)";

        const direction = document.createElement("div");
        direction.style.fontSize = "24px";
        direction.style.fontWeight = "bold";
        direction.style.marginTop = "12px";
        direction.textContent = "—";

        container.appendChild(label);
        container.appendChild(direction);

        makeSwipeable(container, {
            sensitivity: 50,
            onSwipe: (dir) => {
                const arrows: Record<string, string> = {
                    up: "\u2191",
                    down: "\u2193",
                    left: "\u2190",
                    right: "\u2192",
                };
                direction.textContent = `${arrows[dir]} ${dir}`;
            },
        });

        return container;
    },
};
