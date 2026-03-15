export class Grid<T> {
    readonly width: number;
    readonly height: number;
    cells: T[][];

    constructor(
        width: number,
        height: number,
        initializer: (x: number, y: number) => T
    ) {
        this.width = width;
        this.height = height;
        this.cells = new Array<T[]>(height);
        for (let y = 0; y < height; y++) {
            this.cells[y] = new Array<T>(width);
            for (let x = 0; x < width; x++) {
                this.cells[y][x] = initializer(x, y);
            }
        }
    }

    getCellAt(x: number, y: number): T | null {
        if (!this.isValidPosition(x, y)) {
            return null;
        }
        return this.cells[y][x];
    }

    setCellAt(x: number, y: number, value: T): void {
        if (!this.isValidPosition(x, y)) {
            return;
        }
        this.cells[y][x] = value;
    }

    isValidPosition(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    getAdjacentCells(x: number, y: number): T[] {
        const adjacent: T[] = [];

        const pastLeft = x > 0;
        const pastRight = x < this.width - 1;
        const pastTop = y > 0;
        const pastBottom = y < this.height - 1;

        if (pastLeft) {
            adjacent.push(this.cells[y][x - 1]);
            if (pastTop) adjacent.push(this.cells[y - 1][x - 1]);
            if (pastBottom) adjacent.push(this.cells[y + 1][x - 1]);
        }
        if (pastRight) {
            adjacent.push(this.cells[y][x + 1]);
            if (pastTop) adjacent.push(this.cells[y - 1][x + 1]);
            if (pastBottom) adjacent.push(this.cells[y + 1][x + 1]);
        }
        if (pastTop) adjacent.push(this.cells[y - 1][x]);
        if (pastBottom) adjacent.push(this.cells[y + 1][x]);

        return adjacent;
    }

    forEach(callback: (cell: T, x: number, y: number) => void): void {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                callback(this.cells[y][x], x, y);
            }
        }
    }

    findCells(
        predicate: (cell: T) => boolean
    ): Array<{ cell: T; x: number; y: number }> {
        const results: Array<{ cell: T; x: number; y: number }> = [];
        this.forEach((cell, x, y) => {
            if (predicate(cell)) {
                results.push({ cell, x, y });
            }
        });
        return results;
    }
}
