/**
 * Minimal OMP config reader for catalyst.specialists overrides.
 *
 * Parses the subset of YAML we need — nested mappings and scalar values.
 * Reads ~/.omp/agent/config.yml (global) + .omp/config.yml (project),
 * deep-merges them, and exposes catalyst.specialists.
 */
import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

/* ── paths ──────────────────────────────────────── */

function getGlobalConfigPath() {
  return join(homedir(), ".omp", "agent", "config.yml");
}

function getProjectConfigPath() {
  return join(process.cwd(), ".omp", "config.yml");
}

/* ── minimal YAML parser (nested maps only) ─────── */

function parseYamlLines(text) {
  const root = {};
  // stack entries: { indent, obj }
  const stack = [{ indent: -1, obj: root }];

  for (const rawLine of text.split("\n")) {
    const trimmed = rawLine.trimEnd();
    const content = trimmed.trimStart();

    // skip empties and comments
    if (content === "" || content.startsWith("#")) continue;

    const indent = trimmed.length - content.length;
    const colonIdx = content.indexOf(":");
    if (colonIdx === -1) continue;

    const key = content.slice(0, colonIdx).trim();
    const rest = content.slice(colonIdx + 1).trim();

    // pop back to right indent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].obj;

    if (rest === "" || rest === "|" || rest === ">") {
      // nested map
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else {
      // scalar value
      parent[key] = rest;
    }
  }

  return root;
}

function readYamlFile(path) {
  try {
    if (!existsSync(path)) return {};
    return parseYamlLines(readFileSync(path, "utf-8"));
  } catch {
    return {};
  }
}

/* ── deep merge helper ──────────────────────────── */

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      result[key] &&
      typeof result[key] === "object" && !Array.isArray(result[key]) &&
      typeof override[key] === "object" && !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(result[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

/* ── public API ─────────────────────────────────── */

/**
 * Read catalyst.modes overrides from OMP config.
 *
 * Returns null when no overrides exist.
 *
 * Config YAML shape:
 *   catalyst:
 *     modes:
 *       <mode>:
 *         <specialist>: <model-spec>
 *
 * Returned shape mirrors the YAML:
 *   { <mode>: { <specialist>: <model-spec> } }
 */
export function readSpecialistOverrides() {
  const global = readYamlFile(getGlobalConfigPath());
  const project = readYamlFile(getProjectConfigPath());
  const merged = deepMerge(global, project);
  return merged?.catalyst?.modes || null;
}
