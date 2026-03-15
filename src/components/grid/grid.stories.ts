import type { Meta, StoryObj } from "@storybook/html";
import { Grid } from ".";

const meta: Meta = {
    title: "Components/Grid",
};

export default meta;
type Story = StoryObj;

export const BasicGrid: Story = {
    render: () => {
        const grid = new Grid(5, 5, (x, y) => (x + y) % 2 === 0);

        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";

        grid.forEach((cell, x, y) => {
            if (x === 0) {
                const row = document.createElement("tr");
                table.appendChild(row);
            }
            const td = document.createElement("td");
            td.style.width = "40px";
            td.style.height = "40px";
            td.style.border = "1px solid #ccc";
            td.style.textAlign = "center";
            td.style.backgroundColor = cell ? "#4a9" : "#fff";
            td.textContent = `${x},${y}`;
            table.lastElementChild!.appendChild(td);
        });

        return table;
    },
};

export const NeighborHighlight: Story = {
    render: () => {
        const grid = new Grid(7, 7, (x, y) => ({ x, y, highlighted: false }));
        const centerX = 3;
        const centerY = 3;

        const neighbors = grid.getAdjacentCells(centerX, centerY);
        neighbors.forEach((cell) => (cell.highlighted = true));

        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";

        grid.forEach((cell, x, y) => {
            if (x === 0) {
                const row = document.createElement("tr");
                table.appendChild(row);
            }
            const td = document.createElement("td");
            td.style.width = "40px";
            td.style.height = "40px";
            td.style.border = "1px solid #ccc";
            td.style.textAlign = "center";
            if (x === centerX && y === centerY) {
                td.style.backgroundColor = "#e44";
                td.textContent = "X";
            } else if (cell.highlighted) {
                td.style.backgroundColor = "#4a9";
                td.textContent = "N";
            }
            table.lastElementChild!.appendChild(td);
        });

        return table;
    },
};
