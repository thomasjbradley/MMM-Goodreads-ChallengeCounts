/**
 * Goodreads Reading Challenge Counts
 * @author Thomas J Bradley <hey@thomasjbradley.ca>
 * @license MIT
 */
const { XMLParser } = require("fast-xml-parser");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const USER_AGENT =
  "MMM-Goodreads-ChallengeCounts (https://github.com/thomasjbradley/MMM-Goodreads-ChallengeCounts)";

/**
 * Challenge sources
 *
 * Each challenge in the config is `[name, source, goal]`, where `source` is either:
 * - A reading challenge account ID (scraped), e.g. `A1EXAMPLEID001`;
 *   the full challenge URL or the token from the end of it work too
 * - A numeric Goodreads user ID (read from the “read” shelf RSS feed)
 *
 * Reading challenge URLs end in a token that is the unpadded base64 of the
 * account ID followed by the unpadded base64 of the year:
 *   …/annual/2026/QTFFWEFNUExFSUQwMDEMjAyNg = base64("A1EXAMPLEID001") + base64("2026")
 * So the account ID is all that’s needed to build the URL for any year.
 */
const ACCOUNT_ID = /^A[0-9A-Z]{6,30}$/u;
const YEAR_TOKEN_LENGTH = 6; // base64("2026") without padding

const base64Unpadded = (str) =>
  Buffer.from(String(str)).toString("base64").replace(/=+$/u, "");

const decodeAccountToken = (token) => {
  const decoded = Buffer.from(token, "base64").toString("latin1");
  return ACCOUNT_ID.test(decoded) && base64Unpadded(decoded) === token ? decoded : null;
};

const accountIdFromSource = (source) => {
  const str = String(source).trim();
  if (ACCOUNT_ID.test(str)) {
    return str;
  }
  const url = str.match(/\/annual\/\d{4}\/(?<token>[A-Za-z0-9]+)/u);
  const token = url ? url.groups.token : str;
  if (!/^[A-Za-z0-9]+$/u.test(token)) {
    return null;
  }
  // The token with or without the year on the end
  return (
    decodeAccountToken(token) ?? decodeAccountToken(token.slice(0, -YEAR_TOKEN_LENGTH))
  );
};

const isFeedSource = (source) => /^\d+$/u.test(String(source).trim());

const challengeUrl = (accountId, year) =>
  `https://www.goodreads.com/readingchallenges/gr/annual/${year}/${base64Unpadded(
    accountId,
  )}${base64Unpadded(year)}`;

const parseGoal = (goal) => {
  const parsed = parseInt(goal, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Scraping: the challenge page embeds its data as `window.urcData = {…};`
 */
const parseChallengePage = (body) => {
  const match = body.match(/window\.urcData\s*=\s*(\{.*?\});\s*$/msu);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      const read = parseInt(data.readingProgress, 10);
      if (!Number.isNaN(read)) {
        return { read: read, goal: parseGoal(data.readingGoal) };
      }
    } catch (e) {
      // Fall through to the text match
    }
  }
  const text = body.match(/read\s*(?<read>\d+)\s*of\s*(?<goal>\d+)\s*books/iu);
  if (text) {
    return {
      read: parseInt(text.groups.read, 10),
      goal: parseGoal(text.groups.goal),
    };
  }
  return null;
};

const getChallengeStats = async (source) => {
  const accountId = accountIdFromSource(source);
  if (!accountId) {
    throw new Error(
      "Not a reading challenge account ID, token or URL, or a numeric user ID",
    );
  }
  const response = await fetch(challengeUrl(accountId, new Date().getFullYear()), {
    method: "GET",
    headers: { Accept: "text/html", "User-Agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Challenge page responded ${response.status}`);
  }
  const stats = parseChallengePage(await response.text());
  if (!stats) {
    throw new Error("Couldn’t find the reading challenge data on the page");
  }
  return { ...stats, pages: null, avgRating: null };
};

/**
 * RSS: count the books on the “read” shelf finished this year
 */
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
    const pages = parseInt(book.book.num_pages, 10);
    if (pages) {
      return pages;
    }
  }
  return 0;
};

const parseFeed = (body) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
  });
  const feed = parser.parse(body);
  let pageCount = 0;
  let readCount = 0;
  let ratings = [];
  if (!isValidFeed(feed)) {
    return null;
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
  return {
    read: readCount,
    goal: null,
    pages: pageCount,
    avgRating: ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null,
  };
};

const getFeedStats = async (userId) => {
  const response = await fetch(
    `https://www.goodreads.com/review/list_rss/${userId}?shelf=read&sort=date_read&per_page=200`,
    {
      method: "GET",
      headers: { Accept: "application/xml", "User-Agent": USER_AGENT },
    },
  );
  if (!response.ok) {
    throw new Error(`RSS feed responded ${response.status}`);
  }
  const stats = parseFeed(await response.text());
  if (!stats) {
    throw new Error("RSS feed was empty or invalid");
  }
  return stats;
};

/**
 * Get every reader’s stats; a reader whose source fails is left out
 * so the others still show.
 */
const getReadCounts = async (config) => {
  const reads = {};
  const results = await Promise.allSettled(
    config.challenges.map(([, source]) =>
      isFeedSource(source) ? getFeedStats(source) : getChallengeStats(source),
    ),
  );
  results.forEach((result, i) => {
    const [name, source, goal] = config.challenges[i];
    if (result.status === "rejected") {
      console.error(
        `MMM-Goodreads-ChallengeCounts: ${name} (${source}): ${result.reason.message}`,
      );
      return;
    }
    const stats = result.value;
    reads[name.toLowerCase().trim()] = {
      ...stats,
      name: name.trim(),
      goal: parseGoal(goal) ?? stats.goal,
    };
  });
  return reads;
};

module.exports = {
  getReadCounts: getReadCounts,
  accountIdFromSource: accountIdFromSource,
  challengeUrl: challengeUrl,
  parseChallengePage: parseChallengePage,
};
