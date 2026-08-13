#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readdir, readFile, rm, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const outputRoot = path.join(projectRoot, "public", "developer-handoffs", "live-source");
const archivePath = path.join(projectRoot, "public", "developer-handoffs", "live-source-complete.tar");
const appRoot = path.join(projectRoot, "app");

const dryRun = process.argv.includes("--dry-run");
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--dry-run");

if (unknownArguments.length > 0) {
  throw new Error(`Unknown argument${unknownArguments.length === 1 ? "" : "s"}: ${unknownArguments.join(", ")}`);
}

const includedAppExtensions = new Set([".ts", ".tsx", ".css", ".json"]);
const importResolutionExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".css"];
const ignoredDirectories = new Set([".git", ".next", "dist", "node_modules", "out"]);

const requiredAppFiles = [
  "app/Showcase.tsx",
  "app/globals.css",
  "app/PatternBoundarySpecimen.tsx",
  "app/patternBoundarySpecimen.module.css",
  "app/trackerScenarioFixtures.ts",
  "app/scenarios.ts",
  "app/site-paths.ts",
];

const explicitFiles = [
  "package.json",
  "tsconfig.json",
  "public/dependency-explorer.html",
];

const explicitDetails = new Map([
  ["app/Showcase.tsx", "Complete legacy showroom implementation and Tech details registry, including the live inline DependencyExplorerFrame."],
  ["app/globals.css", "Global design tokens, responsive rules, theme states, and live showroom component styling."],
  ["app/PatternBoundarySpecimen.tsx", "Reusable semantic preview renderer used to illustrate component and pattern boundaries."],
  ["app/patternBoundarySpecimen.module.css", "Scoped presentation and state styling for PatternBoundarySpecimen."],
  ["app/trackerScenarioFixtures.ts", "Typed Tracker task, flow, route, and DCC scenario fixtures used by the live patterns."],
  ["app/scenarios.ts", "Scenario contracts and representative Compass, Tracker, and dependency-explorer data."],
  ["app/site-paths.ts", "Base-path adapter used by deployable links, fetches, downloads, and embedded previews."],
  ["package.json", "Runtime dependencies, development dependencies, Node version, and project scripts needed to install and run the source."],
  ["tsconfig.json", "TypeScript compiler, module-resolution, JSX, path, and strictness settings for the live source."],
  ["public/dependency-explorer.html", "Standalone dependency-explorer runtime loaded by the inline DependencyExplorerFrame implementation."],
]);

function comparePaths(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function relativeProjectPath(absolutePath) {
  const relativePath = path.relative(projectRoot, absolutePath);
  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`Refusing to package a path outside the project: ${absolutePath}`);
  }
  return toPosixPath(relativePath);
}

async function isFile(absolutePath) {
  try {
    return (await stat(absolutePath)).isFile();
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function collectAppSources(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) => comparePaths(left.name, right.name))) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...await collectAppSources(absolutePath));
      continue;
    }
    if (entry.isFile() && includedAppExtensions.has(path.extname(entry.name))) files.push(absolutePath);
  }

  return files;
}

function extractModuleSpecifiers(source) {
  const specifiers = new Set();
  const binding = String.raw`(?:[A-Za-z_$][\w$]*(?:\s*,\s*(?:\{[^}]*\}|\*(?:\s+as\s+[A-Za-z_$][\w$]*)?))?|\{[^}]*\}|\*(?:\s+as\s+[A-Za-z_$][\w$]*)?)`;
  const staticModule = new RegExp(String.raw`(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?(?:${binding}\s+from\s+)?["']([^"']+)["']\s*;?`, "g");
  const dynamicModule = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

  for (const expression of [staticModule, dynamicModule]) {
    let match;
    while ((match = expression.exec(source)) !== null) specifiers.add(match[1]);
  }

  return [...specifiers].sort(comparePaths);
}

async function resolveLocalModule(importerPath, rawSpecifier) {
  if (!rawSpecifier.startsWith(".")) return null;

  const specifier = rawSpecifier.split(/[?#]/, 1)[0];
  const basePath = path.resolve(path.dirname(importerPath), specifier);
  const candidates = [
    basePath,
    ...importResolutionExtensions.map((extension) => `${basePath}${extension}`),
    ...importResolutionExtensions.map((extension) => path.join(basePath, `index${extension}`)),
  ];

  for (const candidate of candidates) {
    if (await isFile(candidate)) return candidate;
  }

  throw new Error(`Unable to resolve ${rawSpecifier} imported by ${relativeProjectPath(importerPath)}`);
}

async function collectDirectLocalDependencies(appFiles) {
  const dependencies = new Set();

  for (const importerPath of appFiles) {
    if (![".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(path.extname(importerPath))) continue;
    const source = await readFile(importerPath, "utf8");
    for (const specifier of extractModuleSpecifiers(source)) {
      const dependencyPath = await resolveLocalModule(importerPath, specifier);
      if (dependencyPath && !dependencyPath.startsWith(`${appRoot}${path.sep}`)) dependencies.add(dependencyPath);
    }
  }

  return [...dependencies];
}

function languageFor(relativePath) {
  if (relativePath.endsWith(".tsx")) return "tsx";
  if (relativePath.endsWith(".ts")) return "typescript";
  if (relativePath.endsWith(".css")) return "css";
  if (relativePath.endsWith(".json")) return "json";
  if (relativePath.endsWith(".html")) return "html";
  if (relativePath.endsWith(".mjs")) return "javascript";
  return path.extname(relativePath).slice(1) || "text";
}

function detailFor(relativePath) {
  const explicitDetail = explicitDetails.get(relativePath);
  if (explicitDetail) return explicitDetail;
  if (relativePath.startsWith("app/foundation/templates/") && relativePath.endsWith(".tsx")) {
    return "Complete live React and TypeScript pattern implementation used by the Compass template renderer.";
  }
  if (relativePath.startsWith("app/") && relativePath.endsWith(".tsx")) {
    return "Complete live React and TypeScript component or route implementation from the application source tree.";
  }
  if (relativePath.startsWith("app/") && relativePath.endsWith(".ts")) {
    return "Live TypeScript types, state, data, or integration logic required by the application source tree.";
  }
  if (relativePath.startsWith("app/") && relativePath.endsWith(".css")) {
    return "Live component-scoped or route-scoped styles required by the application source tree.";
  }
  if (relativePath.startsWith("app/") && relativePath.endsWith(".json")) {
    return "Application-owned structured data required by the live source tree.";
  }
  if (relativePath.startsWith("public/")) {
    return "Local public data or runtime asset imported or loaded directly by the live application source.";
  }
  return "Project source required to install, compile, or recreate the live component library.";
}

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

function writeTarString(header, offset, length, value) {
  const encoded = Buffer.from(value, "utf8");
  if (encoded.length > length) throw new Error(`Tar header value is too long: ${value}`);
  encoded.copy(header, offset);
}

function writeTarOctal(header, offset, length, value) {
  const encoded = value.toString(8).padStart(length - 1, "0") + "\0";
  writeTarString(header, offset, length, encoded);
}

function splitUstarPath(archiveEntryPath) {
  if (Buffer.byteLength(archiveEntryPath) <= 100) return { name: archiveEntryPath, prefix: "" };

  for (let index = archiveEntryPath.lastIndexOf("/"); index > 0; index = archiveEntryPath.lastIndexOf("/", index - 1)) {
    const prefix = archiveEntryPath.slice(0, index);
    const name = archiveEntryPath.slice(index + 1);
    if (Buffer.byteLength(prefix) <= 155 && Buffer.byteLength(name) <= 100) return { name, prefix };
  }

  throw new Error(`Path cannot be represented by a ustar header: ${archiveEntryPath}`);
}

function createTarHeader(archiveEntryPath, size) {
  const header = Buffer.alloc(512);
  const { name, prefix } = splitUstarPath(archiveEntryPath);

  writeTarString(header, 0, 100, name);
  writeTarOctal(header, 100, 8, 0o644);
  writeTarOctal(header, 108, 8, 0);
  writeTarOctal(header, 116, 8, 0);
  writeTarOctal(header, 124, 12, size);
  writeTarOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  writeTarString(header, 156, 1, "0");
  writeTarString(header, 257, 6, "ustar\0");
  writeTarString(header, 263, 2, "00");
  writeTarString(header, 345, 155, prefix);

  const checksum = [...header].reduce((sum, byte) => sum + byte, 0);
  writeTarString(header, 148, 8, checksum.toString(8).padStart(6, "0") + "\0 ");
  return header;
}

function createTarArchive(entries) {
  const chunks = [];

  for (const entry of entries) {
    const archiveEntryPath = `live-source/${entry.path}`;
    chunks.push(createTarHeader(archiveEntryPath, entry.contents.length), entry.contents);
    const padding = (512 - (entry.contents.length % 512)) % 512;
    if (padding > 0) chunks.push(Buffer.alloc(padding));
  }

  chunks.push(Buffer.alloc(1024));
  return Buffer.concat(chunks);
}

async function main() {
  const appFiles = await collectAppSources(appRoot);
  const appRelativePaths = new Set(appFiles.map(relativeProjectPath));

  for (const requiredFile of requiredAppFiles) {
    if (!appRelativePaths.has(requiredFile)) throw new Error(`Required live source is missing: ${requiredFile}`);
  }

  const directDependencies = await collectDirectLocalDependencies(appFiles);
  const requestedFiles = new Set([
    ...appFiles,
    ...directDependencies,
    ...explicitFiles.map((relativePath) => path.join(projectRoot, relativePath)),
  ]);

  const sourceEntries = [];
  for (const absolutePath of [...requestedFiles].sort((left, right) => comparePaths(relativeProjectPath(left), relativeProjectPath(right)))) {
    if (!await isFile(absolutePath)) throw new Error(`Required handoff source is missing: ${relativeProjectPath(absolutePath)}`);
    const relativePath = relativeProjectPath(absolutePath);
    const contents = await readFile(absolutePath);
    sourceEntries.push({
      path: relativePath,
      contents,
      manifest: {
        path: relativePath,
        language: languageFor(relativePath),
        detail: detailFor(relativePath),
        hash: `sha256:${sha256(contents)}`,
        bytes: contents.length,
      },
    });
  }

  const manifest = {
    version: 1,
    generator: "scripts/sync-developer-handoffs.mjs",
    root: "public/developer-handoffs/live-source",
    files: sourceEntries.map((entry) => entry.manifest),
  };
  const manifestContents = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const archiveEntries = [
    ...sourceEntries.map(({ path: entryPath, contents }) => ({ path: entryPath, contents })),
    { path: "manifest.json", contents: manifestContents },
  ].sort((left, right) => comparePaths(left.path, right.path));
  const archiveContents = createTarArchive(archiveEntries);

  if (!dryRun) {
    const expectedOutput = path.join(projectRoot, "public", "developer-handoffs", "live-source");
    if (outputRoot !== expectedOutput) throw new Error(`Refusing to clear unexpected output directory: ${outputRoot}`);

    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(outputRoot, { recursive: true });

    for (const entry of sourceEntries) {
      const destination = path.join(outputRoot, entry.path);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, entry.contents);
    }

    await writeFile(path.join(outputRoot, "manifest.json"), manifestContents);
    await writeFile(archivePath, archiveContents);
  }

  const action = dryRun ? "Would mirror" : "Mirrored";
  console.log(`${action} ${sourceEntries.length} files to public/developer-handoffs/live-source/.`);
  console.log(`${dryRun ? "Would create" : "Created"} public/developer-handoffs/live-source-complete.tar (${archiveContents.length} bytes).`);
}

await main();
