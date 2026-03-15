import type { Meta, StoryObj } from "@storybook/html";
import { makeDraggable } from ".";

const meta: Meta = {
    title: "Components/Draggable",
};

export default meta;
type Story = StoryObj;

export const BasicDrag: Story = {
    render: () => {
        const container = document.createElement("div");
        container.style.position = "relative";
        container.style.width = "400px";
        container.style.height = "300px";
        container.style.border = "2px dashed #ccc";

        const box = document.createElement("div");
        box.style.position = "absolute";
        box.style.left = "50px";
        box.style.top = "50px";
        box.style.width = "80px";
        box.style.height = "80px";
        box.style.backgroundColor = "#4a9";
        box.style.borderRadius = "8px";
        box.style.cursor = "grab";
        box.style.display = "flex";
        box.style.alignItems = "center";
        box.style.justifyContent = "center";
        box.style.color = "white";
        box.style.fontWeight = "bold";
        box.textContent = "Drag me";

        container.appendChild(box);
        makeDraggable(box, { snapBack: false });

        return container;
    },
};

export const WithDropZones: Story = {
    render: () => {
        const container = document.createElement("div");
        container.style.position = "relative";
        container.style.width = "500px";
        container.style.height = "300px";
        container.style.border = "2px dashed #ccc";

        const dropZone = document.createElement("div");
        dropZone.style.position = "absolute";
        dropZone.style.right = "20px";
        dropZone.style.top = "20px";
        dropZone.style.width = "120px";
        dropZone.style.height = "120px";
        dropZone.style.border = "2px dashed #e44";
        dropZone.style.borderRadius = "8px";
        dropZone.style.display = "flex";
        dropZone.style.alignItems = "center";
        dropZone.style.justifyContent = "center";
        dropZone.style.color = "#e44";
        dropZone.textContent = "Drop here";

        const box = document.createElement("div");
        box.style.position = "absolute";
        box.style.left = "20px";
        box.style.top = "20px";
        box.style.width = "80px";
        box.style.height = "80px";
        box.style.backgroundColor = "#4a9";
        box.style.borderRadius = "8px";
        box.style.cursor = "grab";
        box.style.display = "flex";
        box.style.alignItems = "center";
        box.style.justifyContent = "center";
        box.style.color = "white";
        box.style.fontWeight = "bold";
        box.textContent = "Drag me";

        container.appendChild(dropZone);
        container.appendChild(box);

        makeDraggable(box, {
            dropZones: [dropZone],
            snapBack: true,
            onDrop: (_el, zone) => {
                if (zone) {
                    dropZone.style.borderColor = "#4a9";
                    dropZone.textContent = "Dropped!";
                }
            },
        });

        return container;
    },
};
