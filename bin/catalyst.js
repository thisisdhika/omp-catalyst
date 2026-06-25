#!/usr/bin/env node
import { program } from "commander";
import { initCommand } from "../lib/commands/init.js";
import { addCommand } from "../lib/commands/add.js";
import { removeCommand } from "../lib/commands/remove.js";
import { statusCommand } from "../lib/commands/status.js";

program
  .name("catalyst")
  .description("Catalyst Squad setup CLI for oh-my-pi")
  .version("1.0.0");

program
  .command("init")
  .description("Interactive setup — select agents and configure rules")
  .action(initCommand);

program
  .command("add")
  .description("Add specific components (subagents, rules, prompts, all)")
  .argument("<target>", "What to add: subagents, rules, prompts, all")
  .action(addCommand);

program
  .command("remove")
  .description("Remove installed components")
  .argument("<target>", "What to remove: subagents, rules, prompts, all")
  .action(removeCommand);

program
  .command("status")
  .description("Show what is installed vs available")
  .action(statusCommand);

program.parse();
