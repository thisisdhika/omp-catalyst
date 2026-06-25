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
  AGENT_DESCRIPTIONS,
} from "../utils.js";

export async function initCommand() {
  console.log(chalk.bold("\n  Catalyst Squad Setup\n"));

  const agentDir = getAgentDir();
  const pluginDir = getPluginDir();
  const agentsDir = join(agentDir, "agents");

  // Step 1: Select agents
  const choices = AGENT_FILES.map((file) => ({
    title: file.replace(".md", ""),
    description: AGENT_DESCRIPTIONS[file],
    value: file,
    selected: true,
  }));

  const { selectedAgents } = await prompts({
    type: "multiselect",
    name: "selectedAgents",
    message: "Select agents to install",
    choices,
    instructions: false,
    hint: "- Space to toggle. Enter to submit.",
  });

  if (!selectedAgents || selectedAgents.length === 0) {
    console.log(chalk.yellow("\n  No agents selected. Skipping."));
  } else {
    let installed = 0;
    let skipped = 0;
    for (const file of selectedAgents) {
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
    console.log(chalk.dim(`\n  Agents: ${installed} installed, ${skipped} skipped`));
  }

  // Step 2: Configure rules
  const rulesSrc = join(pluginDir, "rules", "RULES.md");
  const rulesDest = join(agentDir, "RULES.md");

  if (fileExists(rulesDest)) {
    const { rulesAction } = await prompts({
      type: "select",
      name: "rulesAction",
      message: "RULES.md already exists. What do you want to do?",
      choices: [
        { title: "Skip — keep existing rules", value: "skip" },
        { title: "Append — add Catalyst rules to existing", value: "append" },
        { title: "Overwrite — replace with Catalyst rules", value: "overwrite" },
      ],
    });

    if (rulesAction === "append") {
      const content = readFile(rulesSrc);
      appendToFile(rulesDest, "\n# Catalyst Squad Rules\n\n" + content);
      console.log(chalk.green("  Rules appended"));
    } else if (rulesAction === "overwrite") {
      copyFile(rulesSrc, rulesDest);
      console.log(chalk.green("  Rules overwritten"));
    } else {
      console.log(chalk.dim("  Rules skipped"));
    }
  } else {
    copyFile(rulesSrc, rulesDest);
    console.log(chalk.green("  Install RULES.md"));
  }

  // Step 3: Install system prompt
  const promptSrc = join(pluginDir, "prompts", "APPEND_SYSTEM.md");
  const promptDest = join(agentDir, "APPEND_SYSTEM.md");

  if (fileExists(promptDest)) {
    const { promptAction } = await prompts({
      type: "select",
      name: "promptAction",
      message: "APPEND_SYSTEM.md already exists. What do you want to do?",
      choices: [
        { title: "Skip — keep existing prompt", value: "skip" },
        { title: "Overwrite — replace with Catalyst prompt", value: "overwrite" },
      ],
    });

    if (promptAction === "overwrite") {
      copyFile(promptSrc, promptDest);
      console.log(chalk.green("  System prompt overwritten"));
    } else {
      console.log(chalk.dim("  System prompt skipped"));
    }
  } else {
    copyFile(promptSrc, promptDest);
    console.log(chalk.green("  Install APPEND_SYSTEM.md"));
  }

  console.log(chalk.bold.green("\n  Setup complete. Run `omp` to start using Catalyst Squad.\n"));
}
