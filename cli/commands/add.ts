import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { getRegistry, type ComponentEntry, type PluginEntry } from "../registry";

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

function copyPlugin(
    plugin: PluginEntry,
    arcadeoSrcDir: string
): void {
    for (const file of plugin.files) {
        const srcPath = path.join(arcadeoSrcDir, file);
        const destPath = path.join(
            process.cwd(),
            "plugins",
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
    .description("Add a component or plugin to your project")
    .argument("<component>", "Component or plugin name to add")
    .action((componentName: string) => {
        const registry = getRegistry();

        const isPlugin = Boolean(registry.plugins[componentName]);
        const isComponent = Boolean(registry.components[componentName]);

        if (!isComponent && !isPlugin) {
            console.error(
                chalk.red(
                    `Unknown component or plugin "${componentName}". Run "npx arcadeo list" to see available items.`
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

        if (isPlugin) {
            const plugin = registry.plugins[componentName];
            console.log(chalk.bold(`\nAdding plugin ${componentName}:\n`));
            copyPlugin(plugin, arcadeoSrcDir);
        } else {
            const config = loadConfig();
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
        }

        console.log(chalk.green("\nDone!\n"));
    });
