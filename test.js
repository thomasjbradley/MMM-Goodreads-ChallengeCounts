#!/usr/bin/env node

"use strict";

const goodreadsApi = require("./goodreads-api.js");

goodreadsApi
  .getReadCounts({
    challenges: [
      ["Thomas", "10000001", 80],
      ["Liz", "10000002", 50],
    ],
  })
  .then((reads) => {
    console.log(reads);
  });
