import * as sinon from "sinon";
import * as childProcess from "child_process";
import * as fs from "fs";
import appIconLabel from "./app-labels";

describe("appIconLabel plugin", () => {
    let execSyncStub: sinon.SinonStub;
    let existsSyncStub: sinon.SinonStub;
    let mkdirSyncStub: sinon.SinonStub;
    let copyFileSyncStub: sinon.SinonStub;
    let readFileSyncStub: sinon.SinonStub;

    const defaultOptions = {
        source: "./public",
        output: "./dist/icons",
        environment: "DEV",
        icons: [
            {
                name: "icon128.png",
                font: { color: "#FFFFFF", size: 24, family: "sans-serif" },
            },
        ],
        position: "bottom" as const,
    };

    beforeEach(() => {
        execSyncStub = sinon.stub(childProcess, "execSync");
        existsSyncStub = sinon.stub(fs, "existsSync");
        mkdirSyncStub = sinon.stub(fs, "mkdirSync");
        copyFileSyncStub = sinon.stub(fs, "copyFileSync");
        readFileSyncStub = sinon.stub(fs, "readFileSync");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("plugin metadata", () => {
        it("should return a plugin with the correct name", () => {
            const plugin = appIconLabel(defaultOptions);
            expect(plugin.name).toBe("vite-plugin-app-icon-label");
        });

        it("should have closeBundle and configureServer hooks", () => {
            const plugin = appIconLabel(defaultOptions);
            expect(typeof plugin.closeBundle).toBe("function");
            expect(typeof plugin.configureServer).toBe("function");
        });
    });

    describe("buildIcons", () => {
        it("should skip icon labeling when ImageMagick is not installed", () => {
            // ImageMagick check throws
            execSyncStub.withArgs("magick -version", sinon.match.any).throws(
                new Error("command not found")
            );

            const plugin = appIconLabel(defaultOptions);
            const mockServer = {
                middlewares: {
                    use: sinon.stub(),
                },
            };

            // configureServer calls buildIcons
            (plugin.configureServer as Function)(mockServer);

            // execSync should have been called only for the version check
            sinon.assert.calledOnce(execSyncStub);
            // mkdirSync should NOT have been called since we bailed early
            sinon.assert.notCalled(mkdirSyncStub);
        });

        it("should create output directory and process icons when ImageMagick is available", () => {
            // ImageMagick version check succeeds
            execSyncStub
                .withArgs("magick -version", sinon.match.any)
                .returns(Buffer.from(""));
            // Output dir doesn't exist
            existsSyncStub.withArgs("./dist/icons").returns(false);
            // Icon source exists
            existsSyncStub.returns(false);

            const plugin = appIconLabel(defaultOptions);
            const mockServer = {
                middlewares: {
                    use: sinon.stub(),
                },
            };

            (plugin.configureServer as Function)(mockServer);

            sinon.assert.called(mkdirSyncStub);
            // The magick command should have been called
            sinon.assert.calledTwice(execSyncStub);
        });
    });

    describe("closeBundle", () => {
        it("should skip processing in watch mode", () => {
            execSyncStub
                .withArgs("magick -version", sinon.match.any)
                .returns(Buffer.from(""));
            existsSyncStub.returns(false);

            const plugin = appIconLabel(defaultOptions);

            // Simulate configResolved
            const mockConfig = { build: { outDir: "dist" } };
            (plugin.configResolved as Function)(mockConfig);

            // Call closeBundle with watchMode = true
            const ctx = { meta: { watchMode: true } };
            (plugin.closeBundle as Function).call(ctx);

            // execSync should NOT be called (skipped in watch mode)
            sinon.assert.notCalled(execSyncStub);
        });

        it("should copy labeled icons to build directory", () => {
            execSyncStub
                .withArgs("magick -version", sinon.match.any)
                .returns(Buffer.from(""));
            existsSyncStub.withArgs("./dist/icons").returns(true);
            // The labeled icon exists
            existsSyncStub
                .withArgs(sinon.match("icon128_DEV.png"))
                .returns(true);
            existsSyncStub.returns(true);

            const plugin = appIconLabel(defaultOptions);

            const mockConfig = { build: { outDir: "dist" } };
            (plugin.configResolved as Function)(mockConfig);

            const ctx = { meta: { watchMode: false } };
            (plugin.closeBundle as Function).call(ctx);

            sinon.assert.called(copyFileSyncStub);
        });
    });

    describe("position option", () => {
        it("should use +0+10 for bottom position", () => {
            execSyncStub
                .withArgs("magick -version", sinon.match.any)
                .returns(Buffer.from(""));
            existsSyncStub.returns(true);

            const plugin = appIconLabel({
                ...defaultOptions,
                position: "bottom",
            });
            const mockServer = { middlewares: { use: sinon.stub() } };
            (plugin.configureServer as Function)(mockServer);

            // Find the magick annotate call and check position
            const magickCall = execSyncStub.args.find((args) =>
                String(args[0]).includes("annotate")
            );
            expect(magickCall).toBeDefined();
            expect(String(magickCall![0])).toContain("+0+10");
        });

        it("should use +0-10 for top position", () => {
            execSyncStub
                .withArgs("magick -version", sinon.match.any)
                .returns(Buffer.from(""));
            existsSyncStub.returns(true);

            const plugin = appIconLabel({
                ...defaultOptions,
                position: "top",
            });
            const mockServer = { middlewares: { use: sinon.stub() } };
            (plugin.configureServer as Function)(mockServer);

            const magickCall = execSyncStub.args.find((args) =>
                String(args[0]).includes("annotate")
            );
            expect(magickCall).toBeDefined();
            expect(String(magickCall![0])).toContain("+0-10");
        });

        it("should use custom x/y coordinates for object position", () => {
            execSyncStub
                .withArgs("magick -version", sinon.match.any)
                .returns(Buffer.from(""));
            existsSyncStub.returns(true);

            const plugin = appIconLabel({
                ...defaultOptions,
                position: { x: 5, y: 15 },
            });
            const mockServer = { middlewares: { use: sinon.stub() } };
            (plugin.configureServer as Function)(mockServer);

            const magickCall = execSyncStub.args.find((args) =>
                String(args[0]).includes("annotate")
            );
            expect(magickCall).toBeDefined();
            expect(String(magickCall![0])).toContain("+5+15");
        });
    });
});
