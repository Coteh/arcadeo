import fs from "fs-extra";
import path from "path";
import { findArcadeoSrcDir } from "./paths";

export interface ComponentEntry {
    name: string;
    description: string;
    files: string[];
    dependencies: string[];
}

export interface Registry {
    components: Record<string, ComponentEntry>;
}

export function getRegistry(): Registry {
    const srcDir = findArcadeoSrcDir();
    if (!srcDir) {
        throw new Error("Could not find registry.json. Is arcadeo installed?");
    }
    return fs.readJsonSync(path.join(srcDir, "registry.json"));
}
