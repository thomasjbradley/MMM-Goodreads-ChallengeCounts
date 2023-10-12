#!/usr/bin/env node

"use strict";

const goodreadsApi = require("./goodreads-api.js");

goodreadsApi
  .getReadCounts({
    challenges: [
      ["Liz", "https://www.goodreads.com/user_challenges/41332601"],
      ["Thomas", "https://www.goodreads.com/user_challenges/40779579"],
    ],
  })
  .then((reads) => {
    console.log(reads);
  });
