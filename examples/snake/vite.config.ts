import { defineConfig, loadEnv } from "vite";
import path from "path";
import appIconLabel from "../../src/plugins/app-labels";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    return {
        server: {
            host: true,
        },
        resolve: {
            alias: {
                arcadeo: path.resolve(__dirname, "../../src"),
            },
        },
        plugins: [
            appIconLabel({
                source: "./public",
                output: "./dist/icons",
                environment: env.DEPLOY_ENV || "DEV",
                icons: [
                    {
                        name: "icon128.png",
                        font: {
                            color: "#FFFFFF",
                            size: 24,
                            family: "sans-serif",
                        },
                    },
                    {
                        name: "icon152.png",
                        font: {
                            color: "#FFFFFF",
                            size: 28,
                            family: "sans-serif",
                        },
                    },
                ],
                position: "bottom",
            }),
        ],
    };
});
