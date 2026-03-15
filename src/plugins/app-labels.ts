import * as path from "path";
import * as fs from "fs";
import * as childProcess from "child_process";
import type { Plugin, ResolvedConfig } from "vite";

interface FontOptions {
    color: string;
    size: number;
    family: string;
}

interface IconConfig {
    name: string;
    font: FontOptions;
}

export interface AppIconLabelOptions {
    source: string;
    output: string;
    environment: string;
    icons: IconConfig[];
    position: "top" | "bottom" | { x: number; y: number };
}

const MAGICK_COMMAND = "magick";

function resolvePositionOption(
    position: AppIconLabelOptions["position"]
): string {
    if (typeof position === "string") {
        return position === "bottom" ? "+0+10" : "+0-10";
    }
    return `+${position.x}+${position.y}`;
}

// TODO: Support other filetypes besides PNG
export default function appIconLabel(options: AppIconLabelOptions): Plugin {
    const { source, output, environment, icons, position } = options;
    let resolvedConfig: ResolvedConfig;

    const buildIcons = (env: string) => {
        try {
            childProcess.execSync(`${MAGICK_COMMAND} -version`, {
                stdio: "ignore",
            });
        } catch (_e) {
            console.warn(
                "ImageMagick is not installed. Skipping icon labeling."
            );
            return;
        }

        // Make output directory
        if (!fs.existsSync(output)) {
            fs.mkdirSync(output, { recursive: true });
        }

        const positionOption = resolvePositionOption(position);

        icons.forEach((icon) => {
            const { name, font } = icon;
            const srcPath = path.join(source, name);
            const destPath = path.join(
                output,
                name.replace(".png", `_${env}.png`)
            );

            // Wrap font.color and env in quotes; font.family may be a file path
            const cmd = `${MAGICK_COMMAND} ${srcPath} -strip -gravity south -fill "${font.color}" -undercolor "#000000AA" -pointsize ${font.size} -font "${font.family}" -annotate ${positionOption} "${env}" ${destPath}`;
            try {
                childProcess.execSync(cmd);
                console.log(
                    `Processed ${name} -> ${path.basename(destPath)}`
                );
            } catch (e) {
                console.error(
                    `Error processing ${name}: ${(e as Error).message}`
                );
            }
        });
    };

    return {
        name: "vite-plugin-app-icon-label",

        configResolved(config) {
            resolvedConfig = config;
        },

        closeBundle() {
            // Do not perform icon build or replacement in watch mode (ie. `vite dev`)
            if (this.meta.watchMode) return;
            buildIcons(environment);
            const buildDir = path.resolve(
                process.cwd(),
                resolvedConfig.build.outDir
            );
            // Copy icons to build directory
            icons.forEach((icon) => {
                const { name } = icon;
                const srcPath = path.join(
                    output,
                    name.replace(".png", `_${environment}.png`)
                );
                const destPath = path.join(buildDir, name);

                if (fs.existsSync(srcPath)) {
                    console.log("Copying", srcPath, "to", destPath);
                    fs.copyFileSync(srcPath, destPath);
                }
            });
        },

        configureServer(server) {
            buildIcons(environment);
            server.middlewares.use((req, res, next) => {
                if (req.url && req.url.startsWith("/icon")) {
                    const iconPath = path.join(
                        output,
                        req.url.replace(".png", `_${environment}.png`)
                    );
                    if (fs.existsSync(iconPath)) {
                        res.setHeader("Content-Type", "image/png");
                        res.end(fs.readFileSync(iconPath));
                        return;
                    }
                }
                next();
            });
        },
    };
}
