/**
 * Goodreads Reading Challenge Counts
 * @author Thomas J Bradley <hey@thomasjbradley.ca>
 * @license MIT Licensed.
 */

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const parseReadCounts = (config, bodies) => {
  const reads = {};
  bodies.forEach((body, i) => {
    const pname = config.challenges[i][0].toLowerCase().trim();
    const match = body.match(/read\s*(?<read>\d+)\s*of\s*(?<goal>\d+)\s*books/iu);
    if (!match) {
      return;
    }
    reads[pname] = {
      name: config.challenges[i][0].trim(),
      read: parseInt(match.groups.read, 10),
      goal: parseInt(match.groups.goal, 10),
    };
  });
  return reads;
};

const getReadCounts = async (config) => {
  const readsPages = [];
  let responses;
  config.challenges.forEach((challenge) => {
    const response = fetch(challenge[1], {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent":
          "MMM-Goodreads-ChallengeCounts (https://github.com/thomasjbradley/MMM-Goodreads-ChallengeCounts)",
      },
    });
    readsPages.push(response);
  });
  responses = await Promise.all(readsPages);
  return parseReadCounts(config, await Promise.all(responses.map((r) => r.text())));
};

module.exports = {
  getReadCounts: getReadCounts,
};
