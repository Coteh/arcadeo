export type SwipeDirection = "up" | "down" | "left" | "right";

export interface SwipeOptions {
    sensitivity?: number;
    onSwipe: (direction: SwipeDirection) => void;
    preventDefault?: boolean;
}

export function makeSwipeable(
    element: HTMLElement,
    options: SwipeOptions
): () => void {
    const sensitivity = options.sensitivity ?? 50;
    const shouldPreventDefault = options.preventDefault ?? true;

    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (event: TouchEvent) => {
        touchStartX = event.changedTouches[0].screenX;
        touchStartY = event.changedTouches[0].screenY;
    };

    const onTouchMove = (event: TouchEvent) => {
        if (shouldPreventDefault) {
            event.preventDefault();
        }
    };

    const onTouchEnd = (event: TouchEvent) => {
        const touchEndX = event.changedTouches[0].screenX;
        const touchEndY = event.changedTouches[0].screenY;

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > sensitivity) {
                options.onSwipe("right");
            } else if (diffX < -sensitivity) {
                options.onSwipe("left");
            }
        } else {
            if (diffY > sensitivity) {
                options.onSwipe("down");
            } else if (diffY < -sensitivity) {
                options.onSwipe("up");
            }
        }
    };

    element.addEventListener("touchstart", onTouchStart);
    element.addEventListener("touchmove", onTouchMove, { passive: false });
    element.addEventListener("touchend", onTouchEnd);

    return () => {
        element.removeEventListener("touchstart", onTouchStart);
        element.removeEventListener("touchmove", onTouchMove);
        element.removeEventListener("touchend", onTouchEnd);
    };
}
