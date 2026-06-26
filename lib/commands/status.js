import { join } from "path";
import chalk from "chalk";
import {
  getAgentDir,
  getPluginDir,
  fileExists,
  AGENT_FILES,
} from "../utils.js";
import { readActiveMode } from "../mode.js";

export async function statusCommand() {
  const agentDir = getAgentDir();
  const pluginDir = getPluginDir();

  console.log(chalk.bold("\n  Catalyst Squad Status\n"));
  console.log(chalk.dim("  Agent directory: ") + agentDir + "\n");

  // Agents
  console.log(chalk.bold("  Agents:"));
  const agentsDir = join(agentDir, "agents");
  for (const file of AGENT_FILES) {
    const destPath = join(agentsDir, file);
    const name = file.replace(".md", "").padEnd(12);
    if (fileExists(destPath)) {
      console.log(chalk.green(`    ${name} installed`) + chalk.dim(`  ${destPath}`));
    } else {
      console.log(chalk.red(`    ${name} not installed`));
    }
  }

  // Rules
  console.log(chalk.bold("\n  Rules:"));
  const rulesPath = join(agentDir, "RULES.md");
  if (fileExists(rulesPath)) {
    console.log(chalk.green("    RULES.md     installed") + chalk.dim(`  ${rulesPath}`));
  } else {
    console.log(chalk.red("    RULES.md     not installed"));
  }

  // Prompts
  console.log(chalk.bold("\n  Prompts:"));
  const promptsPath = join(agentDir, "APPEND_SYSTEM.md");
  if (fileExists(promptsPath)) {
    console.log(chalk.green("    APPEND_SYSTEM installed") + chalk.dim(`  ${promptsPath}`));
  } else {
    console.log(chalk.red("    APPEND_SYSTEM not installed"));
  }

  // Skills (auto-discovered, always available)
  console.log(chalk.bold("\n  Skills (auto-discovered from plugin):"));
  const skillPath = join(pluginDir, "skills", "one-on-one", "SKILL.md");
  if (fileExists(skillPath)) {
    console.log(chalk.green("    one-on-one   available") + chalk.dim("  (grilling skill)"));
  }

  // Mode
  console.log(chalk.bold("\n  Mode:"));
  const activeMode = readActiveMode();
  if (activeMode) {
    console.log(chalk.green(`    ${activeMode}`));
  } else {
    console.log(chalk.dim("    default (original models)"));
  }

  console.log("");
}
