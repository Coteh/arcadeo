import { Command } from "commander";
import chalk from "chalk";
import { getRegistry } from "../registry";

export const listCommand = new Command("list")
    .description("List all available components")
    .action(() => {
        const registry = getRegistry();
        const components = Object.values(registry.components);

        console.log(chalk.bold("\nAvailable components:\n"));

        for (const component of components) {
            const deps =
                component.dependencies.length > 0
                    ? chalk.gray(` (deps: ${component.dependencies.join(", ")})`)
                    : "";
            console.log(
                `  ${chalk.cyan(component.name.padEnd(14))} ${component.description}${deps}`
            );
        }

        console.log(
            `\n  ${chalk.gray(`${components.length} components available`)}\n`
        );
    });
