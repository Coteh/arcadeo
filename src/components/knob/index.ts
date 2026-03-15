export interface KnobOptions {
    label: string;
    enabled?: boolean;
    onChange?: (enabled: boolean) => void;
}

export function createKnob(options: KnobOptions): HTMLElement {
    const container = document.createElement("div");
    container.className = "settings-item";

    const label = document.createElement("span");
    label.className = "settings-label";
    label.textContent = options.label;

    const knob = document.createElement("div");
    knob.className = "knob";
    if (options.enabled) {
        knob.classList.add("enabled");
    }

    const knobInside = document.createElement("div");
    knobInside.className = "knob-inside";
    knob.appendChild(knobInside);

    container.appendChild(label);
    container.appendChild(knob);

    container.addEventListener("click", () => {
        const isEnabled = knob.classList.toggle("enabled");
        options.onChange?.(isEnabled);
    });

    return container;
}
