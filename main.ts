// makefun-x-reposts-02 entry point.
//
// The deliverable for this bounty is POSTS.json itself: it names the
// entrant's X posts. The grader drops this repo into a bot directory and
// expects the program to hand POSTS.json over, unchanged, in the output
// directory. So this program reads POSTS.json from the bot dir, checks it
// really is the document the bounty asks for (a JSON object whose "posts"
// field is an array of 1 to 15 post URLs), and then copies the file
// byte-for-byte into the output dir.
//
// Nothing else: no network, no clock, no files outside the repo, and
// silence on success. Any problem is reported on stderr with exit code 1.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const sourcePath = join(botDir, "POSTS.json");

// Read the raw bytes first: the copy must be byte-for-byte, so the file is
// never re-serialised from the parsed value.
let bytes: Buffer;
try {
  bytes = readFileSync(sourcePath);
} catch {
  fail(`cannot read ${sourcePath}`);
}

// Validate the shape before handing anything over. A malformed POSTS.json
// is an entrant error, not something to pass along silently.
let parsed: unknown;
try {
  parsed = JSON.parse(bytes.toString("utf8"));
} catch {
  fail(`${sourcePath} is not valid JSON`);
}

const posts = (parsed as { posts?: unknown } | null)?.posts;
if (!Array.isArray(posts)) {
  fail(`${sourcePath} must contain a "posts" array`);
}
if (posts.length < 1 || posts.length > 15) {
  fail(`"posts" must list between 1 and 15 posts, found ${posts.length}`);
}
for (const post of posts) {
  if (typeof post !== "string" || post.length === 0) {
    fail(`every entry in "posts" must be a non-empty string`);
  }
}

try {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "POSTS.json"), bytes);
} catch {
  fail(`cannot write POSTS.json into ${outputDir}`);
}
