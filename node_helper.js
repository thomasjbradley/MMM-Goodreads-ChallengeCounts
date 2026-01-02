/**
 * Goodreads Reading Challenge Counts
 * @author Thomas J Bradley <hey@thomasjbradley.ca>
 * @license MIT
 */

"use strict";

const NodeHelper = require("node_helper");
const goodreadsApi = require("./goodreads-api");

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-Goodreads-ChallengeCounts helper started");
  },
  getReadCounts: function (config) {
    goodreadsApi.getReadCounts(config).then((wins) => {
      this.sendSocketNotification("READ_COUNTS", wins);
    });
  },
  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_READ_COUNTS") {
      this.getReadCounts(payload);
    }
  },
});
