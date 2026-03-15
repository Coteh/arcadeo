import { Command } from "commander";
import prompts from "prompts";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

export const initCommand = new Command("init")
    .description("Initialize arcadeo configuration in your project")
    .action(async () => {
        const configPath = path.resolve(process.cwd(), "arcadeo.json");

        if (fs.existsSync(configPath)) {
            console.log(
                chalk.yellow("arcadeo.json already exists. Skipping init.")
            );
            return;
        }

        const response = await prompts([
            {
                type: "text",
                name: "srcDir",
                message: "Where should components be placed?",
                initial: "src/components",
            },
            {
                type: "confirm",
                name: "typescript",
                message: "Use TypeScript?",
                initial: true,
            },
        ]);

        if (!response.srcDir) {
            console.log(chalk.red("Init cancelled."));
            return;
        }

        const config = {
            srcDir: response.srcDir,
            typescript: response.typescript,
        };

        fs.writeJsonSync(configPath, config, { spaces: 2 });
        console.log(chalk.green("Created arcadeo.json"));
    });
