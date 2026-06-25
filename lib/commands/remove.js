import { join } from "path";
import chalk from "chalk";
import {
  getAgentDir,
  getPluginDir,
  removeFile,
  AGENT_FILES,
} from "../utils.js";

export async function removeCommand(target) {
  const agentDir = getAgentDir();

  switch (target) {
    case "subagents": {
      const agentsDir = join(agentDir, "agents");
      let removed = 0;
      for (const file of AGENT_FILES) {
        const path = join(agentsDir, file);
        if (removeFile(path)) {
          console.log(chalk.green(`  Remove ${file}`));
          removed++;
        } else {
          console.log(chalk.dim(`  Skip ${file} — not installed`));
        }
      }
      console.log(chalk.dim(`\n  Removed ${removed} agent(s)\n`));
      break;
    }
    case "rules": {
      const path = join(agentDir, "RULES.md");
      if (removeFile(path)) {
        console.log(chalk.green("  Remove RULES.md\n"));
      } else {
        console.log(chalk.dim("  RULES.md not installed\n"));
      }
      break;
    }
    case "prompts": {
      const path = join(agentDir, "APPEND_SYSTEM.md");
      if (removeFile(path)) {
        console.log(chalk.green("  Remove APPEND_SYSTEM.md\n"));
      } else {
        console.log(chalk.dim("  APPEND_SYSTEM.md not installed\n"));
      }
      break;
    }
    case "all":
      await removeCommand("subagents");
      await removeCommand("rules");
      await removeCommand("prompts");
      break;
    default:
      console.log(chalk.red(`Unknown target: ${target}. Use: subagents, rules, prompts, all`));
  }
}
