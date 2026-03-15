import type { Meta, StoryObj } from "@storybook/html";
import { createKnob, KnobOptions } from ".";
import "./knob.css";

const meta: Meta<KnobOptions> = {
    title: "Components/Knob",
    render: (args) => createKnob(args),
    argTypes: {
        label: { control: "text" },
        enabled: { control: "boolean" },
    },
};

export default meta;
type Story = StoryObj<KnobOptions>;

export const Default: Story = {
    args: {
        label: "Dark Mode",
        enabled: false,
        onChange: (enabled) => console.log("Toggled:", enabled),
    },
};

export const Enabled: Story = {
    args: {
        label: "Sound Effects",
        enabled: true,
        onChange: (enabled) => console.log("Toggled:", enabled),
    },
};

export const MultipleKnobs: Story = {
    render: () => {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "12px";

        const knobs = [
            { label: "Hard Mode", enabled: false },
            { label: "Animations", enabled: true },
            { label: "Sound Effects", enabled: true },
            { label: "Fullscreen", enabled: false },
        ];

        knobs.forEach((opts) => {
            container.appendChild(
                createKnob({
                    ...opts,
                    onChange: (enabled) =>
                        console.log(`${opts.label}: ${enabled}`),
                })
            );
        });

        return container;
    },
};
