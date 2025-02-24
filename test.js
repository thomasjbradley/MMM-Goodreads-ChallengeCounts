#!/usr/bin/env node

"use strict";

const goodreadsApi = require("./goodreads-api.js");

goodreadsApi
  .getReadCounts({
    challenges: [
      ["Thomas", "5284049", 80],
      ["Liz", "17061373", 50],
      ["Edith", "174718219", 50],
    ],
  })
  .then((reads) => {
    console.log(reads);
  });
