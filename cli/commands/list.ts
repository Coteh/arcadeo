import { Command } from "commander";
import chalk from "chalk";
import { getRegistry } from "../registry";

export const listCommand = new Command("list")
    .description("List all available components and plugins")
    .action(() => {
        const registry = getRegistry();
        const components = Object.values(registry.components);
        const plugins = Object.values(registry.plugins);

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

        if (plugins.length > 0) {
            console.log(chalk.bold("Available plugins:\n"));

            for (const plugin of plugins) {
                const deps =
                    plugin.dependencies.length > 0
                        ? chalk.gray(` (deps: ${plugin.dependencies.join(", ")})`)
                        : "";
                console.log(
                    `  ${chalk.magenta(plugin.name.padEnd(14))} ${plugin.description}${deps}`
                );
            }

            console.log(
                `\n  ${chalk.gray(`${plugins.length} plugins available`)}\n`
            );
        }
    });
