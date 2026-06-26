import { homedir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, unlinkSync, appendFileSync } from "fs";
import prompts from "prompts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getAgentDir() {
  return process.env.PI_CODING_AGENT_DIR || join(homedir(), ".omp", "agent");
}

export function getPluginDir() {
  return join(__dirname, "..");
}

export function fileExists(path) {
  return existsSync(path);
}

export function readFile(path) {
  return readFileSync(path, "utf-8");
}

export function copyFile(src, dest) {
  const dir = dirname(dest);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  copyFileSync(src, dest);
}

export function appendToFile(path, content) {
  appendFileSync(path, "\n" + content);
}

export function removeFile(path) {
  if (existsSync(path)) {
    unlinkSync(path);
    return true;
  }
  return false;
}

export async function confirmAction(message) {
  const response = await prompts({
    type: "confirm",
    name: "confirmed",
    message,
    initial: false,
  });
  return response.confirmed;
}

export const AGENT_FILES = [
  "scout.md",
  "researcher.md",
  "planner.md",
  "worker.md",
  "reviewer.md",
  "tester.md",
  "designer.md",
  "debugger.md",
  "oracle.md",
  "kugutsu.md",
];

export const AGENT_DESCRIPTIONS = {
  "scout.md": "Fast codebase reconnaissance, external research, and deep context assembly",
  "researcher.md": "Deep external knowledge and product research agent",
  "planner.md": "Implementation planning and high-level design",
  "worker.md": "Implementation execution — code, tests, docs, infrastructure",
  "reviewer.md": "Code, security, performance, and product review",
  "tester.md": "Test generation, validation, and product testing agent",
  "designer.md": "Visual design, UI/UX review, and UI debugging",
  "debugger.md": "Root cause analysis and product behavior debugging",
  "oracle.md": "Risk assessment, design review, and product impact agent",
  "kugutsu.md": "Ultra-class multi-agent orchestration — delegates to specialists, synthesizes results",
};
