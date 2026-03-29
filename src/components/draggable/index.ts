export interface DragOptions {
    dropZones?: HTMLElement[];
    onDragStart?: (element: HTMLElement, event: PointerEvent) => void;
    onDrag?: (element: HTMLElement, x: number, y: number) => void;
    onDrop?: (
        element: HTMLElement,
        dropZone: HTMLElement | null
    ) => void;
    groupChildren?: boolean;
    childOffsetFn?: (index: number) => { x: number; y: number };
    snapBack?: boolean;
}

export function makeDraggable(
    element: HTMLElement,
    options: DragOptions = {}
): () => void {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let origLeft = "";
    let origTop = "";
    let origZIndex = "";

    element.style.touchAction = "none";

    const onPointerDown = (e: PointerEvent) => {
        e.preventDefault();
        isDragging = true;

        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        origLeft = element.style.left;
        origTop = element.style.top;
        origZIndex = element.style.zIndex;
        element.style.zIndex = "10000";
        element.style.transition = "none";

        element.setPointerCapture(e.pointerId);
        options.onDragStart?.(element, e);
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        e.preventDefault();

        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        element.style.left = x + "px";
        element.style.top = y + "px";

        options.onDrag?.(element, x, y);
    };

    const onPointerUp = (_e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;

        element.style.transition = "";

        const matchedZone = findDropZone(element, options.dropZones ?? []);
        if (!matchedZone && (options.snapBack ?? true)) {
            element.style.left = origLeft;
            element.style.top = origTop;
        }

        element.style.zIndex = origZIndex;
        options.onDrop?.(element, matchedZone);
    };

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointercancel", onPointerUp);

    return () => {
        element.removeEventListener("pointerdown", onPointerDown);
        element.removeEventListener("pointermove", onPointerMove);
        element.removeEventListener("pointerup", onPointerUp);
        element.removeEventListener("pointercancel", onPointerUp);
    };
}

function findDropZone(
    dragged: HTMLElement,
    dropZones: HTMLElement[]
): HTMLElement | null {
    const dragRect = dragged.getBoundingClientRect();
    const centerX = dragRect.left + dragRect.width / 2;
    const centerY = dragRect.top + dragRect.height / 2;
    for (const zone of dropZones) {
        if (zone === dragged) continue;
        const zoneRect = zone.getBoundingClientRect();
        if (
            centerX >= zoneRect.left &&
            centerX <= zoneRect.left + zoneRect.width &&
            centerY >= zoneRect.top &&
            centerY <= zoneRect.top + zoneRect.height
        ) {
            return zone;
        }
    }
    return null;
}
