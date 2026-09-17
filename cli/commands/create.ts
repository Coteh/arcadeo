import { Command } from "commander";
import prompts from "prompts";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { getRegistry, type ComponentEntry } from "../registry";
import { findArcadeoSrcDir } from "../paths";
import {
    indexHtml,
    indexTs,
    packageJson,
    styleCss,
    tsconfigJson,
    viteConfig,
    type ScaffoldOptions,
} from "../scaffold";

// What a game starts with unless told otherwise: enough to have a theme, a
// score that survives a reload, and touch controls.
const DEFAULT_COMPONENTS = ["game", "storage", "theme", "swipeable"];

function resolveDependencies(
    name: string,
    registry: ReturnType<typeof getRegistry>,
    resolved: Set<string> = new Set()
): string[] {
    const component = registry.components[name];
    if (!component) return [];
    for (const dep of component.dependencies) {
        if (!resolved.has(dep)) {
            resolveDependencies(dep, registry, resolved);
            resolved.add(dep);
        }
    }
    resolved.add(name);
    return Array.from(resolved);
}

function copyComponent(
    component: ComponentEntry,
    targetDir: string,
    srcDir: string,
    arcadeoSrcDir: string
): void {
    for (const file of component.files) {
        const from = path.join(arcadeoSrcDir, file);
        const to = path.join(
            targetDir,
            srcDir,
            component.name,
            path.basename(file)
        );
        fs.ensureDirSync(path.dirname(to));
        fs.copySync(from, to);
        console.log(`  ${chalk.green("+")} ${path.relative(targetDir, to)}`);
    }
}

function titleFrom(name: string): string {
    return name
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export const createCommand = new Command("create")
    .description("Scaffold a new game project")
    .argument("[name]", "Project name, used as the directory name")
    .option("-d, --dir <path>", "Directory to create the project in")
    .option("--title <title>", "Title shown in the page and header")
    .option(
        "-c, --components <names>",
        `Comma-separated components to include (default: ${DEFAULT_COMPONENTS.join(",")})`
    )
    .option("--src-dir <dir>", "Where components are placed", "src/components")
    .option("-f, --force", "Scaffold into a non-empty directory")
    .option(
        "-y, --yes",
        "Take the defaults and never prompt, for non-interactive use"
    )
    .action(async (nameArg: string | undefined, opts) => {
        let name = nameArg?.trim();

        // Prompting is opt-out so the command can run headless, which is how
        // anything automating it has to call it.
        if (!name && !opts.yes) {
            const answer = await prompts({
                type: "text",
                name: "name",
                message: "Project name?",
                initial: "my-game",
            });
            name = answer.name?.trim();
        }
        if (!name) {
            console.error(
                chalk.red(
                    "A project name is required. Pass it as an argument, or drop --yes to be asked."
                )
            );
            process.exit(1);
        }

        const targetDir = path.resolve(process.cwd(), opts.dir ?? name);
        if (
            fs.existsSync(targetDir) &&
            fs.readdirSync(targetDir).length > 0 &&
            !opts.force
        ) {
            console.error(
                chalk.red(
                    `${path.relative(process.cwd(), targetDir) || "."} is not empty. Use --force to scaffold into it anyway.`
                )
            );
            process.exit(1);
        }

        const arcadeoSrcDir = findArcadeoSrcDir();
        if (!arcadeoSrcDir) {
            console.error(
                chalk.red(
                    "Could not find arcadeo source files. Is arcadeo installed?"
                )
            );
            process.exit(1);
        }

        const registry = getRegistry();
        const requested = opts.components
            ? String(opts.components)
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
            : DEFAULT_COMPONENTS;

        const unknown = requested.filter((c: string) => !registry.components[c]);
        if (unknown.length > 0) {
            console.error(
                chalk.red(
                    `Unknown component${unknown.length > 1 ? "s" : ""}: ${unknown.join(", ")}. Run "npx arcadeo list" to see what is available.`
                )
            );
            process.exit(1);
        }

        const scaffold: ScaffoldOptions = {
            name,
            title: (opts.title as string | undefined)?.trim() || titleFrom(name),
            srcDir: opts.srcDir,
        };

        console.log(chalk.bold(`\nCreating ${scaffold.title} in ${targetDir}\n`));

        fs.ensureDirSync(path.join(targetDir, "src"));
        const files: Array<[string, string]> = [
            ["package.json", packageJson(scaffold)],
            ["tsconfig.json", tsconfigJson()],
            ["vite.config.ts", viteConfig()],
            ["index.html", indexHtml(scaffold)],
            [path.join("src", "index.ts"), indexTs()],
            [path.join("src", "style.css"), styleCss()],
            [
                "arcadeo.json",
                JSON.stringify(
                    { srcDir: scaffold.srcDir, typescript: true },
                    null,
                    2
                ) + "\n",
            ],
        ];
        for (const [name, contents] of files) {
            fs.outputFileSync(path.join(targetDir, name), contents);
            console.log(`  ${chalk.green("+")} ${name}`);
        }

        // Components are copied in rather than imported from the package, so
        // the game owns its copy and can be changed freely.
        const toAdd = new Set<string>();
        for (const component of requested) {
            for (const dep of resolveDependencies(component, registry)) {
                toAdd.add(dep);
            }
        }
        for (const componentName of toAdd) {
            const component = registry.components[componentName];
            if (component) {
                copyComponent(
                    component,
                    targetDir,
                    scaffold.srcDir,
                    arcadeoSrcDir
                );
            }
        }

        console.log(chalk.green("\nDone.\n"));
        console.log("Next:");
        console.log(chalk.cyan(`  cd ${path.relative(process.cwd(), targetDir) || "."}`));
        console.log(chalk.cyan("  npm install"));
        console.log(chalk.cyan("  npm run dev\n"));
    });
