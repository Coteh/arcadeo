import { Command } from "commander";
import { addCommand } from "./commands/add";
import { listCommand } from "./commands/list";
import { initCommand } from "./commands/init";
import { createCommand } from "./commands/create";

const program = new Command();

program
    .name("arcadeo")
    .description("CLI for adding Arcadeo game components to your project")
    .version("1.0.0");

program.addCommand(createCommand);
program.addCommand(initCommand);
program.addCommand(listCommand);
program.addCommand(addCommand);

program.parse();
