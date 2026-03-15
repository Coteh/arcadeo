import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

export interface ComponentEntry {
    name: string;
    description: string;
    files: string[];
    dependencies: string[];
}

export interface PluginEntry {
    name: string;
    description: string;
    files: string[];
    dependencies: string[];
}

export interface Registry {
    components: Record<string, ComponentEntry>;
    plugins: Record<string, PluginEntry>;
}

export function getRegistry(): Registry {
    // Try local src/registry.json first (for development)
    const localPath = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        "src",
        "registry.json"
    );
    if (fs.existsSync(localPath)) {
        const data = fs.readJsonSync(localPath);
        return { plugins: {}, ...data };
    }

    // Fallback to node_modules
    const nmPath = path.resolve(
        process.cwd(),
        "node_modules",
        "arcadeo",
        "src",
        "registry.json"
    );
    if (fs.existsSync(nmPath)) {
        const data = fs.readJsonSync(nmPath);
        return { plugins: {}, ...data };
    }

    throw new Error(
        "Could not find registry.json. Is arcadeo installed?"
    );
}
