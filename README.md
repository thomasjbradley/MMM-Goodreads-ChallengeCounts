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
                ["Liz", "https://www.goodreads.com/user_challenges/41332601"],
                ["Thomas", "https://www.goodreads.com/user_challenges/40779579"],
              ],
            }
        }
    ]
}
```

## Config options

| Option         | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| challenges     | An array of arrays: each sub-array having the reader’s name & shared challenge URL |
| updateInterval | *Optional* How often to update the win stats; Default 15 minutes                   |
