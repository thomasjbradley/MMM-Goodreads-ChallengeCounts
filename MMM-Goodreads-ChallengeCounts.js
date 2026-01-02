/**
 * Goodreads Reading Challenge Counts
 * @author Thomas J Bradley <hey@thomasjbradley.ca>
 * @license MIT
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
      const readsGroup = document.createElement("div");
      const ddRead = document.createElement("dd");
      const ddGoal = document.createElement("dd");
      const personName = document.createElement("strong");
      const pageCount = document.createElement("em");
      group.classList.add("goodreads-count");
      readsGroup.classList.add("goodreads-count-reads");
      if (reader.read >= reader.goal) {
        readsGroup.classList.add("goodreads-count-goal-complete");
      }
      dt.classList.add("goodreads-count-name");
      personName.innerText = reader.name;
      pageCount.innerText = `${reader.pages} pages`;
      dt.appendChild(personName);
      dt.appendChild(pageCount);
      ddRead.classList.add("goodreads-count-read");
      ddRead.innerText = reader.read;
      ddGoal.classList.add("goodreads-count-goal");
      ddGoal.innerText = reader.goal;
      group.appendChild(dt);
      readsGroup.appendChild(ddRead);
      readsGroup.appendChild(ddGoal);
      group.appendChild(readsGroup);
      dl.appendChild(group);
    });
    div.appendChild(dl);
    return div;
  },

  getReadCounts: function () {
    this.sendSocketNotification("GET_READ_COUNTS", this.config);
  },

  scheduleUpdate: function () {
    setInterval(() => {
      this.getReadCounts();
    }, this.config.updateInterval);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "READ_COUNTS") {
      this.result.reads = payload;
      this.updateDom(0);
    }
  },
});
