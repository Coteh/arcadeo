import { makeDraggable } from ".";

type EventMap = { [type: string]: EventListenerOrEventListenerObject[] };

function makeMockElement(rect: {
    left: number;
    top: number;
    width: number;
    height: number;
}): HTMLElement {
    const listeners: EventMap = {};
    const el = {
        style: { touchAction: "", zIndex: "", transition: "", left: "", top: "" },
        getBoundingClientRect: () => ({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            right: rect.left + rect.width,
            bottom: rect.top + rect.height,
        }),
        setPointerCapture: (_id: number) => {},
        addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
            if (!listeners[type]) listeners[type] = [];
            listeners[type].push(listener);
        },
        removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => {
            if (!listeners[type]) return;
            listeners[type] = listeners[type].filter((l) => l !== listener);
        },
        dispatchEvent: (event: Event) => {
            (listeners[event.type] ?? []).forEach((l) => {
                if (typeof l === "function") l(event);
                else l.handleEvent(event);
            });
            return true;
        },
    } as unknown as HTMLElement;
    return el;
}

function makePointerEvent(type: string, clientX: number, clientY: number): PointerEvent {
    return {
        type,
        clientX,
        clientY,
        pointerId: 1,
        preventDefault: () => {},
    } as unknown as PointerEvent;
}

describe("makeDraggable – findDropZone center-point hit testing", () => {
    it("matches a drop zone whose bounds contain the dragged element center", () => {
        // Dragged element: 100x100 at (10, 10) → center (60, 60)
        const dragged = makeMockElement({ left: 10, top: 10, width: 100, height: 100 });
        // Drop zone fully covers the center
        const zone = makeMockElement({ left: 0, top: 0, width: 200, height: 200 });

        let droppedOn: HTMLElement | null = undefined as unknown as HTMLElement | null;
        makeDraggable(dragged, {
            dropZones: [zone],
            snapBack: false,
            onDrop: (_el, dz) => {
                droppedOn = dz;
            },
        });

        dragged.dispatchEvent(makePointerEvent("pointerdown", 60, 60));
        dragged.dispatchEvent(makePointerEvent("pointerup", 60, 60));

        expect(droppedOn).toBe(zone);
    });

    it("does not match a drop zone that overlaps the dragged rect but not its center", () => {
        // Dragged element: 100x100 at (0, 0) → center (50, 50)
        // Dragged element right edge is at 100, bottom edge at 100
        const dragged = makeMockElement({ left: 0, top: 0, width: 100, height: 100 });
        // Drop zone only covers x: 80-200, y: 0-200 — overlaps the AABB but center (50,50) is outside
        const zone = makeMockElement({ left: 80, top: 0, width: 120, height: 200 });

        let droppedOn: HTMLElement | null = undefined as unknown as HTMLElement | null;
        makeDraggable(dragged, {
            dropZones: [zone],
            snapBack: false,
            onDrop: (_el, dz) => {
                droppedOn = dz;
            },
        });

        dragged.dispatchEvent(makePointerEvent("pointerdown", 50, 50));
        dragged.dispatchEvent(makePointerEvent("pointerup", 50, 50));

        expect(droppedOn).toBeNull();
    });

    it("matches the zone that contains the center even when multiple zones partially overlap", () => {
        // Dragged: 100x100 at (40, 0) → center (90, 50)
        const dragged = makeMockElement({ left: 40, top: 0, width: 100, height: 100 });
        // Zone A covers x: 0-80 → does NOT contain center x=90
        const zoneA = makeMockElement({ left: 0, top: 0, width: 80, height: 100 });
        // Zone B covers x: 80-200 → DOES contain center x=90
        const zoneB = makeMockElement({ left: 80, top: 0, width: 120, height: 100 });

        let droppedOn: HTMLElement | null = undefined as unknown as HTMLElement | null;
        makeDraggable(dragged, {
            dropZones: [zoneA, zoneB],
            snapBack: false,
            onDrop: (_el, dz) => {
                droppedOn = dz;
            },
        });

        dragged.dispatchEvent(makePointerEvent("pointerdown", 90, 50));
        dragged.dispatchEvent(makePointerEvent("pointerup", 90, 50));

        expect(droppedOn).toBe(zoneB);
    });
});
