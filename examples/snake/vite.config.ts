import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    server: {
        host: true,
    },
    resolve: {
        alias: {
            arcadeo: path.resolve(__dirname, "../../src"),
        },
    },
});
