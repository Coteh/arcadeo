import { Command } from "commander";
import prompts from "prompts";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

export const initCommand = new Command("init")
    .description("Initialize arcadeo configuration in your project")
    .option("--src-dir <dir>", "Where components should be placed")
    .option("--javascript", "Use JavaScript rather than TypeScript")
    .option(
        "-y, --yes",
        "Take the defaults and never prompt, for non-interactive use"
    )
    .action(async (opts) => {
        const configPath = path.resolve(process.cwd(), "arcadeo.json");

        if (fs.existsSync(configPath)) {
            console.log(
                chalk.yellow("arcadeo.json already exists. Skipping init.")
            );
            return;
        }

        const defaults = {
            srcDir: "src/components",
            typescript: !opts.javascript,
        };

        // Prompting is opt-out: with no TTY, prompts resolves to nothing and
        // the command would cancel itself, so anything automating this needs
        // a way to answer up front.
        let response: { srcDir?: string; typescript?: boolean };
        if (opts.yes || opts.srcDir) {
            response = {
                srcDir: opts.srcDir ?? defaults.srcDir,
                typescript: defaults.typescript,
            };
        } else {
            response = await prompts([
                {
                    type: "text",
                    name: "srcDir",
                    message: "Where should components be placed?",
                    initial: defaults.srcDir,
                },
                {
                    type: "confirm",
                    name: "typescript",
                    message: "Use TypeScript?",
                    initial: true,
                },
            ]);
        }

        if (!response.srcDir) {
            console.log(chalk.red("Init cancelled."));
            return;
        }

        const config = {
            srcDir: response.srcDir,
            typescript: response.typescript ?? defaults.typescript,
        };

        fs.writeJsonSync(configPath, config, { spaces: 2 });
        console.log(chalk.green("Created arcadeo.json"));
    });
