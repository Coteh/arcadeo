import { Grid } from ".";

describe("Grid", () => {
    it("should create a grid with the correct dimensions", () => {
        const grid = new Grid(3, 4, (x, y) => ({ x, y }));
        expect(grid.width).toBe(3);
        expect(grid.height).toBe(4);
        expect(grid.cells.length).toBe(4);
        expect(grid.cells[0].length).toBe(3);
    });

    it("should initialize cells with the initializer function", () => {
        const grid = new Grid(2, 2, (x, y) => x + y);
        expect(grid.getCellAt(0, 0)).toBe(0);
        expect(grid.getCellAt(1, 0)).toBe(1);
        expect(grid.getCellAt(0, 1)).toBe(1);
        expect(grid.getCellAt(1, 1)).toBe(2);
    });

    it("should return null for out-of-bounds positions", () => {
        const grid = new Grid(3, 3, () => 0);
        expect(grid.getCellAt(-1, 0)).toBeNull();
        expect(grid.getCellAt(0, -1)).toBeNull();
        expect(grid.getCellAt(3, 0)).toBeNull();
        expect(grid.getCellAt(0, 3)).toBeNull();
    });

    it("should set and get cell values", () => {
        const grid = new Grid(3, 3, () => 0);
        grid.setCellAt(1, 1, 42);
        expect(grid.getCellAt(1, 1)).toBe(42);
    });

    it("should not set values at invalid positions", () => {
        const grid = new Grid(3, 3, () => 0);
        grid.setCellAt(-1, 0, 99);
        grid.setCellAt(3, 0, 99);
        // should not throw
    });

    it("should validate positions correctly", () => {
        const grid = new Grid(3, 3, () => 0);
        expect(grid.isValidPosition(0, 0)).toBe(true);
        expect(grid.isValidPosition(2, 2)).toBe(true);
        expect(grid.isValidPosition(-1, 0)).toBe(false);
        expect(grid.isValidPosition(3, 0)).toBe(false);
    });

    describe("getAdjacentCells", () => {
        it("should return 8 neighbors for center cell", () => {
            const grid = new Grid(3, 3, (x, y) => y * 3 + x);
            const adjacent = grid.getAdjacentCells(1, 1);
            expect(adjacent.length).toBe(8);
            expect(adjacent).toContain(0); // top-left
            expect(adjacent).toContain(1); // top
            expect(adjacent).toContain(2); // top-right
            expect(adjacent).toContain(3); // left
            expect(adjacent).toContain(5); // right
            expect(adjacent).toContain(6); // bottom-left
            expect(adjacent).toContain(7); // bottom
            expect(adjacent).toContain(8); // bottom-right
        });

        it("should return 3 neighbors for corner cell", () => {
            const grid = new Grid(3, 3, (x, y) => y * 3 + x);
            const adjacent = grid.getAdjacentCells(0, 0);
            expect(adjacent.length).toBe(3);
            expect(adjacent).toContain(1); // right
            expect(adjacent).toContain(3); // below
            expect(adjacent).toContain(4); // diagonal
        });

        it("should return 5 neighbors for edge cell", () => {
            const grid = new Grid(3, 3, (x, y) => y * 3 + x);
            const adjacent = grid.getAdjacentCells(1, 0);
            expect(adjacent.length).toBe(5);
        });
    });

    it("should iterate over all cells with forEach", () => {
        const grid = new Grid(2, 2, () => 0);
        let count = 0;
        grid.forEach(() => count++);
        expect(count).toBe(4);
    });

    it("should find cells matching a predicate", () => {
        const grid = new Grid(3, 3, (x, y) => x + y);
        const results = grid.findCells((cell) => cell === 2);
        expect(results.length).toBe(3);
        expect(results).toEqual(
            expect.arrayContaining([
                { cell: 2, x: 2, y: 0 },
                { cell: 2, x: 1, y: 1 },
                { cell: 2, x: 0, y: 2 },
            ])
        );
    });
});
