/**
 * Goodreads Reading Challenge Counts
 * @author Thomas J Bradley <hey@thomasjbradley.ca>
 * @license MIT Licensed.
 */
const { XMLParser } = require("fast-xml-parser");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const isValidFeed = (reads) => {
  if (
    !Object.hasOwn(reads, "rss") ||
    !Object.hasOwn(reads.rss, "channel") ||
    !Object.hasOwn(reads.rss.channel, "item") ||
    !reads.rss.channel.item ||
    !Array.isArray(reads.rss.channel.item)
  ) {
    return false;
  }
  return true;
};

const isBookWithinYear = (book) => {
  const dt_read = new Date(book.user_read_at);
  if (
    Number.isNaN(dt_read.valueOf()) ||
    dt_read.getFullYear() !== new Date().getFullYear()
  ) {
    return false;
  }
  return true;
};

const parseRating = (book) => {
  if (!Object.hasOwn(book, "user_rating")) {
    return false;
  }
  return parseFloat(book.user_rating);
};

const parsePages = (book) => {
  if (Object.hasOwn(book, "book") && Object.hasOwn(book.book, "num_pages")) {
    try {
      const pages = parseInt(book.book.num_pages, 10);
      if (pages) {
        return pages;
      }
    } catch (e) {
      return 0;
    }
  }
  return 0;
};

const parseReadCounts = (config, bodies) => {
  const reads = {};
  bodies.forEach((body, i) => {
    const parser = new XMLParser({
      ignoreAttributes: false,
    });
    let feed = parser.parse(body);
    let pageCount = 0;
    let readCount = 0;
    let ratings = [];
    if (!isValidFeed(feed)) {
      return;
    }
    feed.rss.channel.item.forEach((book) => {
      if (!Object.hasOwn(book, "user_read_at")) {
        return;
      }
      if (!isBookWithinYear(book)) {
        return;
      }
      readCount += 1;
      pageCount += parsePages(book);
      let rating = parseRating(book);
      if (rating !== false) {
        ratings.push(rating);
      }
    });
    const pname = config.challenges[i][0].toLowerCase().trim();
    reads[pname] = {
      name: config.challenges[i][0].trim(),
      read: readCount,
      goal: config.challenges[i][2],
      pages: pageCount,
      avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
    };
  });
  return reads;
};

const getReadCounts = async (config) => {
  const readsPages = [];
  let responses;
  config.challenges.forEach((challenge) => {
    const response = fetch(
      `https://www.goodreads.com/review/list_rss/${challenge[1]}?shelf=read&sort=date_read&per_page=200`,
      {
        method: "GET",
        headers: {
          Accept: "application/xml",
          "User-Agent":
            "MMM-Goodreads-ChallengeCounts (https://github.com/thomasjbradley/MMM-Goodreads-ChallengeCounts)",
        },
      },
    );
    readsPages.push(response);
  });
  responses = await Promise.all(readsPages);
  return parseReadCounts(config, await Promise.all(responses.map((r) => r.text())));
};

module.exports = {
  getReadCounts: getReadCounts,
};
