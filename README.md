# Goodreads reading challenge stats for MagicMirror

**Load the read & goal reading challenge stats from Goodreads to show on-screen.**

---

## Instal the module

To install, clone this repo into the `~/MagicMirror/modules` directory. Then move into the folder and install the required dependencies.

```
cd ~/MagicMirror/modules
git clone https://github.com/thomasjbradley/MMM-Goodreads-ChallengeCounts
cd MMM-Goodreads-ChallengeCounts
npm install
```

## Set up the module

Set up the module by adding the following configuration block to the modules array in your `config/config.js` file:

```js
var config = {
    modules: [
        {
            module: 'MMM-Goodreads-ChallengeCounts',
            position: 'bottom_left',
            config: {
              challenges: [
                ["Liz", "A1EXAMPLEID002"],
                ["Thomas", "A1EXAMPLEID001"],
              ],
            }
        }
    ]
}
```

## Config options

| Option         | Description                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| challenges     | An array of arrays: each sub-array having the reader’s name, the source (see below) & an *optional* goal that overrides Goodreads |
| updateInterval | *Optional* How often to update the win stats; Default 15 minutes                                                                  |

## Sources

Each reader can use either source:

- **Reading challenge account ID** (recommended): open the reader’s Reading Challenge on Goodreads & copy the page URL, like `https://www.goodreads.com/readingchallenges/gr/annual/2026/QTFFWEFNUExFSUQwMDEMjAyNg`. The read count & goal are scraped from the page, for whichever year it is, so it only needs setting once. Page counts aren’t available from this page.
  - The config accepts the full URL, the token from the end of it, or the short account ID inside the token: the token is the base64 of the account ID followed by the base64 of the year. Decode the part before the year to get the account ID, e.g. `QTFFWEFNUExFSUQwMDE` → `A1EXAMPLEID001`.
- **Goodreads user ID**: the ID from the URL of the reader’s “My Books” page. The books read this year, pages & ratings are counted from the “read” shelf’s RSS feed. *Goodreads has removed these RSS feeds, so this only works if they come back.*

When the goal is left out of the config, the goal set on Goodreads is used—the RSS feed has no goal, so RSS readers need one in the config.
