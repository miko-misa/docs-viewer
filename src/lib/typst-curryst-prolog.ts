import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const prologPath = join(moduleDir, "typst-curryst-prolog.typ");

export const CURRYST_TYPST_PROLOG = readFileSync(prologPath, "utf8");
