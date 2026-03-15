import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { getRegistry, type ComponentEntry } from "../registry";

interface ArcadeoConfig {
    srcDir: string;
    typescript: boolean;
}

function loadConfig(): ArcadeoConfig {
    const configPath = path.resolve(process.cwd(), "arcadeo.json");
    if (!fs.existsSync(configPath)) {
        console.error(
            chalk.red(
                'No arcadeo.json found. Run "npx arcadeo init" first.'
            )
        );
        process.exit(1);
    }
    return fs.readJsonSync(configPath);
}

function resolveDependencies(
    componentName: string,
    registry: ReturnType<typeof getRegistry>,
    resolved: Set<string> = new Set()
): string[] {
    const component = registry.components[componentName];
    if (!component) return [];

    for (const dep of component.dependencies) {
        if (!resolved.has(dep)) {
            resolveDependencies(dep, registry, resolved);
            resolved.add(dep);
        }
    }
    resolved.add(componentName);
    return Array.from(resolved);
}

function copyComponent(
    component: ComponentEntry,
    config: ArcadeoConfig,
    arcadeoSrcDir: string
): void {
    for (const file of component.files) {
        const srcPath = path.join(arcadeoSrcDir, file);
        const destPath = path.join(
            process.cwd(),
            config.srcDir,
            component.name,
            path.basename(file)
        );

        fs.ensureDirSync(path.dirname(destPath));
        fs.copySync(srcPath, destPath);
        console.log(
            `  ${chalk.green("+")} ${path.relative(process.cwd(), destPath)}`
        );
    }
}

export const addCommand = new Command("add")
    .description("Add a component to your project")
    .argument("<component>", "Component name to add")
    .action((componentName: string) => {
        const config = loadConfig();
        const registry = getRegistry();

        if (!registry.components[componentName]) {
            console.error(
                chalk.red(
                    `Unknown component "${componentName}". Run "npx arcadeo list" to see available components.`
                )
            );
            process.exit(1);
        }

        // Find arcadeo source directory (in node_modules or locally)
        let arcadeoSrcDir = path.resolve(__dirname, "..", "..", "src");
        if (!fs.existsSync(arcadeoSrcDir)) {
            // Fallback: try node_modules
            arcadeoSrcDir = path.resolve(
                process.cwd(),
                "node_modules",
                "arcadeo",
                "src"
            );
        }

        if (!fs.existsSync(arcadeoSrcDir)) {
            console.error(
                chalk.red("Could not find arcadeo source files.")
            );
            process.exit(1);
        }

        const componentsToAdd = resolveDependencies(
            componentName,
            registry
        );

        console.log(chalk.bold(`\nAdding ${componentName}:\n`));

        for (const name of componentsToAdd) {
            const component = registry.components[name];
            if (component) {
                copyComponent(component, config, arcadeoSrcDir);
            }
        }

        console.log(chalk.green("\nDone!\n"));
    });
