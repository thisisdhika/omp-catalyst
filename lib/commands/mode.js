import chalk from "chalk";
import { getValidModes, readActiveMode, writeActiveMode, applyModeToAll } from "../mode.js";

export async function modeCommand(mode) {
  const validModes = getValidModes();

  // No argument or unknown mode → show current state + available modes
  if (!mode || !validModes.includes(mode)) {
    const current = readActiveMode();
    console.log(chalk.bold("\n  Catalyst Mode\n"));
    if (current) {
      console.log(`  Active mode: ${chalk.green(current)}\n`);
    } else {
      console.log(chalk.dim("  No mode set — using original agent models\n"));
    }
    console.log(chalk.bold("  Available modes:"));
    for (const m of validModes) {
      const label = m === "default" ? " (original shipped models)" : "";
      console.log(`    ${chalk.cyan(m)}${chalk.dim(label)}`);
    }
    console.log("");
    console.log(chalk.dim("  Usage: catalyst mode <mode>\n"));
    return;
  }

  const { changed, failed } = applyModeToAll(mode);
  writeActiveMode(mode);

  console.log(chalk.bold(`\n  Catalyst Mode: ${chalk.green(mode)}\n`));
  console.log(`  Updated ${changed} agent model(s)`);
  if (failed.length > 0) {
    console.log(chalk.red(`  ${failed.length} file(s) failed: ${failed.join(", ")}`));
  }
  console.log("");
}
