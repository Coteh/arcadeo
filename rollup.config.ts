import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import { defineConfig } from "rollup";

export default defineConfig([
    // Library build
    {
        input: "src/index.ts",
        output: [
            {
                dir: "dist/esm",
                format: "esm",
                preserveModules: true,
                preserveModulesRoot: "src",
                entryFileNames: "[name].js",
            },
            {
                dir: "dist/cjs",
                format: "cjs",
                preserveModules: true,
                preserveModulesRoot: "src",
                entryFileNames: "[name].cjs",
            },
        ],
        plugins: [
            typescript({
                tsconfig: "./tsconfig.build.json",
                declaration: true,
                declarationDir: "./dist/types",
            }),
            copy({
                targets: [
                    {
                        src: "src/components/**/*.css",
                        dest: "dist/css",
                    },
                ],
            }),
        ],
        external: ["fs", "path"],
    },
    // CLI build
    {
        input: "cli/index.ts",
        output: {
            dir: "dist/cli",
            format: "esm",
            preserveModules: true,
            preserveModulesRoot: "cli",
            entryFileNames: "[name].js",
            banner: "#!/usr/bin/env node",
        },
        plugins: [
            typescript({
                tsconfig: "./tsconfig.cli.json",
            }),
        ],
        external: [
            "fs",
            "fs-extra",
            "path",
            "commander",
            "prompts",
            "chalk",
            "url",
        ],
    },
]);
