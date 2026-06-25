import { join } from "path";
import prompts from "prompts";
import chalk from "chalk";
import {
  getAgentDir,
  getPluginDir,
  fileExists,
  copyFile,
  readFile,
  appendToFile,
  AGENT_FILES,
} from "../utils.js";

export async function addCommand(target) {
  const agentDir = getAgentDir();
  const pluginDir = getPluginDir();

  switch (target) {
    case "subagents":
      await addSubagents(agentDir, pluginDir);
      break;
    case "rules":
      await addRules(agentDir, pluginDir);
      break;
    case "prompts":
      await addPrompts(agentDir, pluginDir);
      break;
    case "all":
      await addSubagents(agentDir, pluginDir);
      await addRules(agentDir, pluginDir);
      await addPrompts(agentDir, pluginDir);
      break;
    default:
      console.log(chalk.red(`Unknown target: ${target}. Use: subagents, rules, prompts, all`));
  }
}

async function addSubagents(agentDir, pluginDir) {
  const agentsDir = join(agentDir, "agents");
  let installed = 0;
  let skipped = 0;

  for (const file of AGENT_FILES) {
    const src = join(pluginDir, "agents", file);
    const dest = join(agentsDir, file);
    if (fileExists(dest)) {
      console.log(chalk.yellow(`  Skip ${file} — already exists`));
      skipped++;
    } else {
      copyFile(src, dest);
      console.log(chalk.green(`  Install ${file}`));
      installed++;
    }
  }
  console.log(chalk.dim(`\n  Subagents: ${installed} installed, ${skipped} skipped\n`));
}

async function addRules(agentDir, pluginDir) {
  const src = join(pluginDir, "rules", "RULES.md");
  const dest = join(agentDir, "RULES.md");

  if (fileExists(dest)) {
    const { action } = await prompts({
      type: "select",
      name: "action",
      message: "RULES.md already exists.",
      choices: [
        { title: "Append to existing", value: "append" },
        { title: "Skip", value: "skip" },
        { title: "Overwrite", value: "overwrite" },
      ],
    });

    if (action === "append") {
      const content = readFile(src);
      appendToFile(dest, "\n# Catalyst Squad Rules\n\n" + content);
      console.log(chalk.green("  Rules appended\n"));
    } else if (action === "overwrite") {
      copyFile(src, dest);
      console.log(chalk.green("  Rules overwritten\n"));
    } else {
      console.log(chalk.dim("  Rules skipped\n"));
    }
  } else {
    copyFile(src, dest);
    console.log(chalk.green("  Install RULES.md\n"));
  }
}

async function addPrompts(agentDir, pluginDir) {
  const src = join(pluginDir, "prompts", "APPEND_SYSTEM.md");
  const dest = join(agentDir, "APPEND_SYSTEM.md");

  if (fileExists(dest)) {
    const { action } = await prompts({
      type: "select",
      name: "action",
      message: "APPEND_SYSTEM.md already exists.",
      choices: [
        { title: "Skip", value: "skip" },
        { title: "Overwrite", value: "overwrite" },
      ],
    });

    if (action === "overwrite") {
      copyFile(src, dest);
      console.log(chalk.green("  Prompts overwritten\n"));
    } else {
      console.log(chalk.dim("  Prompts skipped\n"));
    }
  } else {
    copyFile(src, dest);
    console.log(chalk.green("  Install APPEND_SYSTEM.md\n"));
  }
}
