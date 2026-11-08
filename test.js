#!/usr/bin/env node

/**
 * Usage: ./test.js [source…]
 * Runs the offline checks, then fetches the live stats for any reading
 * challenge account IDs (or numeric RSS user IDs) passed as arguments.
 */

"use strict";

const assert = require("node:assert");
const goodreadsApi = require("./goodreads-api.js");

// The account ID can be given directly, as the token (with or without the year), or as the URL
[
  "A1EXAMPLEID001",
  "QTFFWEFNUExFSUQwMDE",
  "QTFFWEFNUExFSUQwMDEMjAyNg",
  "https://www.goodreads.com/readingchallenges/gr/annual/2026/QTFFWEFNUExFSUQwMDEMjAyNg",
].forEach((source) => {
  assert.strictEqual(goodreadsApi.accountIdFromSource(source), "A1EXAMPLEID001");
});
assert.strictEqual(goodreadsApi.accountIdFromSource("not-an-id"), null);

// The challenge URL is built for whichever year it is
assert.strictEqual(
  goodreadsApi.challengeUrl("A1EXAMPLEID001", 2027),
  "https://www.goodreads.com/readingchallenges/gr/annual/2027/QTFFWEFNUExFSUQwMDEMjAyNw",
);

console.log("Offline checks passed");

const sources = process.argv.slice(2);
if (sources.length) {
  goodreadsApi
    .getReadCounts({
      challenges: sources.map((source, i) => [`Reader ${i + 1}`, source]),
    })
    .then((reads) => {
      console.log(reads);
    });
}
