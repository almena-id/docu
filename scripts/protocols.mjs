// The protocol specifications (`task refs`), published as they are in their
// repositories — ../mediator/SPEC.md and ../wallet/SPEC.md — under
// src/content/docs/integrate/protocols/. Never edit those pages: change the
// specification in its repository and regenerate them.
import { readFile, writeFile } from "node:fs/promises";

const OUT = "src/content/docs/integrate/protocols";
const SPECS = [
  { source: "../mediator/SPEC.md", repo: "mediator", page: "mediator", order: 1 },
  { source: "../wallet/SPEC.md", repo: "wallet", page: "wallet", order: 2 },
];

/** Outside code — fenced blocks and spans — `<` would open HTML: escape it. */
function safe(markdown) {
  return markdown
    .split(/(^```[\s\S]*?^```)/m)
    .map((part, i) =>
      i % 2
        ? part
        : part
            .split(/(`[^`\n]*`)/)
            .map((piece, j) => (j % 2 ? piece : piece.replace(/</g, "&lt;")))
            .join(""),
    )
    .join("");
}

for (const { source, repo, page, order } of SPECS) {
  const text = await readFile(source, "utf8");
  const [, title, rest] = text.match(/^# (.+)\n([\s\S]*)$/);
  const base = `https://github.com/almena-id/${repo}/blob/main/`;
  const body = safe(rest)
    // Links to the repository's own files point at it on GitHub.
    .replace(/\]\((?!https?:|#|mailto:)([^)]+)\)/g, (_, path) => `](${base}${path.replace(/^\.\//, "")})`)
    .replace(/^\[([^\]]+)\]: (?!https?:|#)(\S+)/gm, (_, ref, path) => `[${ref}]: ${base}${path.replace(/^\.\//, "")}`);
  const description = rest.match(/\n\n(This document specifies[^\n]*?\.)/)?.[1] ?? title;
  const page_ = [
    "---",
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description.replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1").replace(/[*`]/g, ""))}`,
    `sidebar: { order: ${order} }`,
    "---",
    "",
    `<!-- Published by scripts/protocols.mjs from ${repo}/SPEC.md: do not edit here, run \`task refs\`. -->`,
    "",
    `:::note[From the ${repo} repository]`,
    `This is \`SPEC.md\` of [almena-id/${repo}](https://github.com/almena-id/${repo}), published as it is there.`,
    ":::",
    "",
    body.trim(),
    "",
  ].join("\n");
  await writeFile(`${OUT}/${page}.md`, page_);
  console.log(`${OUT}/${page}.md: ${title}`);
}
