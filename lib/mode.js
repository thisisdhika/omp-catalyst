import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { getAgentDir, getPluginDir, AGENT_FILES } from "./utils.js";
import { readSpecialistOverrides } from "./config.js";

const MODE_STATE_FILE = ".catalyst-mode";

const MODE_AGENT_FILES = AGENT_FILES;
const AGENT_NAMES = MODE_AGENT_FILES.map((file) => file.replace(".md", ""));


function readModelField(content) {
  const stringMatch = content.match(/^model:[ \t]+([^\n]+)$/m);
  if (stringMatch) return stringMatch[1].trim();

  const listMatch = content.match(/^model:\s*\n\s*-\s+([^\n]+)$/m);
  if (listMatch) return listMatch[1].trim();

  return null;
}

function readBundledModels() {
  const agentsDir = join(getPluginDir(), "agents");
  const defaults = {};
  for (const file of MODE_AGENT_FILES) {
    const name = file.replace(".md", "");
    try {
      const content = readFileSync(join(agentsDir, file), "utf-8");
      const model = readModelField(content);
      if (model) defaults[name] = model;
    } catch {
      // leave missing entries absent; callers will skip them
    }
  }

  return defaults;
}

// Model definitions come from catalyst.modes in OMP config.yml.
// Config shape: catalyst.modes.<mode>.<specialist> = <model-spec>
// Internal shape is identical, so raw config is used directly.
const CONFIG_OVERRIDES = readSpecialistOverrides() || {};

const MODE_MODELS = {
  ...CONFIG_OVERRIDES,
  default: readBundledModels(),
};

export function getModeStatePath() {
  return join(getAgentDir(), MODE_STATE_FILE);
}

export function readActiveMode() {
  try {
    const data = JSON.parse(readFileSync(getModeStatePath(), "utf-8"));
    return data.mode || null;
  } catch {
    return null;
  }
}

export function writeActiveMode(mode) {
  const dir = getAgentDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(getModeStatePath(), JSON.stringify({ mode }, null, 2) + "\n");
}

export function getModelForAgent(agentName, mode) {
  return MODE_MODELS[mode]?.[agentName] || null;
}

export function getValidModes() {
  return Object.keys(MODE_MODELS);
}

export function updateFrontmatterModel(content, newModel) {
  const bareUpdated = content.replace(/^model:[ \t]+.+$/m, `model: ${newModel}`);
  if (bareUpdated !== content) return bareUpdated;

  const listUpdated = content.replace(/^(model:)\s*\n\s*-\s+.+$/m, `$1\n  - ${newModel}`);
  if (listUpdated !== content) return listUpdated;

  return null;
}

export function applyModeToFile(filePath, agentName, mode) {
  const newModel = getModelForAgent(agentName, mode);
  if (!newModel) return false;

  try {
    const content = readFileSync(filePath, "utf-8");
    const updated = updateFrontmatterModel(content, newModel);
    if (updated) {
      writeFileSync(filePath, updated);
      return true;
    }
  } catch {
    // skip unreadable files
  }

  return false;
}

export function applyModeToAll(mode) {
  const mapping = MODE_MODELS[mode];
  if (!mapping) throw new Error(`Unknown mode: ${mode}`);

  const agentsDir = join(getAgentDir(), "agents");
  if (!existsSync(agentsDir)) return { changed: 0, failed: [] };

  let changed = 0;
  const failed = [];

  for (const entry of readdirSync(agentsDir)) {
    if (!entry.endsWith(".md")) continue;
    const name = entry.replace(".md", "");
    if (!AGENT_NAMES.includes(name)) continue;

    const filePath = join(agentsDir, entry);
    try {
      const content = readFileSync(filePath, "utf-8");
      const newModel = mapping[name];
      if (!newModel) continue;
      const updated = updateFrontmatterModel(content, newModel);
      if (updated) {
        writeFileSync(filePath, updated);
        changed++;
      }
    } catch {
      failed.push(entry);
    }
  }

  return { changed, failed };
}
