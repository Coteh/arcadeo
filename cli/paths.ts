import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Locate the arcadeo source tree that components are copied from.
 *
 * The CLI runs from three places: this repo's source (cli/), this repo's
 * build output (dist/cli/), and a consumer's node_modules. import.meta.url is
 * used rather than __dirname because the CLI is ESM, where __dirname does not
 * exist.
 */
export function findArcadeoSrcDir(): string | null {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
        path.resolve(here, "..", "src"),
        path.resolve(here, "..", "..", "src"),
        path.resolve(process.cwd(), "node_modules", "arcadeo", "src"),
    ];
    for (const candidate of candidates) {
        if (fs.existsSync(path.join(candidate, "registry.json"))) {
            return candidate;
        }
    }
    return null;
}
