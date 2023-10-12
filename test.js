#!/usr/bin/env node

"use strict";

const goodreadsApi = require("./goodreads-api.js");

goodreadsApi
  .getReadCounts({
    challenges: [
      ["Liz", "https://www.goodreads.com/user_challenges/20000002"],
      ["Thomas", "https://www.goodreads.com/user_challenges/20000001"],
    ],
  })
  .then((reads) => {
    console.log(reads);
  });
