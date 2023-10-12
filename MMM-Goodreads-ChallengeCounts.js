/**
 * Goodreads Reading Challenge Counts
 * @author Thomas J Bradley <hey@thomasjbradley.ca>
 * @license MIT Licensed.
 */

"use strict";

Module.register("MMM-Goodreads-ChallengeCounts", {
  result: { loading: "Loading reading stats...", reads: {} },

  defaults: {
    title: "Reading stats",
    updateInterval: 1000 * 60 * 15, // Every 15 minutes
    challenges: [],
  },

  start: function () {
    this.getReadCounts();
    this.scheduleUpdate();
  },

  getDom: function () {
    const div = document.createElement("div");
    const dl = document.createElement("dl");
    div.classList.add("goodreads-read-counts-wrapper");
    dl.classList.add("goodreads-read-counts");
    if (Object.keys(this.result.reads).length <= 0) {
      const p = document.createElement("p");
      p.innerText = this.result.loading;
      p.classList.add("goodreads-loading");
      div.appendChild(p);
      return div;
    }
    this.config.challenges.forEach((challenge) => {
      const reader = this.result.reads[challenge[0].toLowerCase().trim()];
      const group = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      group.classList.add("goodreads-count");
      dt.classList.add("goodreads-count-name");
      dt.innerText = reader.name;
      dd.classList.add("goodreads-count-read");
      dd.innerText = `${reader.read} of ${reader.goal}`;
      group.appendChild(dt);
      group.appendChild(dd);
      dl.appendChild(group);
    });
    div.appendChild(dl);
    return div;
  },

  getReadCounts: function () {
    this.sendSocketNotification("GET_READ_COUNTS", this.config);
  },

  scheduleUpdate: function () {
    setInterval(function () {
      this.getReadCounts();
    }, this.config.updateInterval);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification == "READ_COUNTS") {
      this.result.reads = payload;
      this.updateDom(0);
    }
  },
});
