import gradient from "gradient-string";

import readline from "readline";
const loaders = [
  "🕛",
  "🕐",
  "🕑",
  "🕒",
  "🕓",
  "🕔",
  "🕕",
  "🕖",
  "🕗",
  "🕘",
  "🕙",
  "🕚",
];
let index = 0;

class Spinner {
  interval;
  constructor(text, currentPosition) {
    this.text = text;
    this.currentPosition = currentPosition;
  }

  start() {
    process.stdout.write("\n".repeat(1));
    this.interval = setInterval(() => {
      readline.cursorTo(
        process.stdout,
        0,
        process.stdout.rows - this.currentPosition
      );
      process.stdout.write(
        gradient.pastel.multiline(`${this.text} ${loaders[index]} `)
      );
      index = (index + 1) % loaders.length;
    }, 100);
  }

  stop() {
    clearInterval(this.interval);
    console.log(`${this.text}`);
  }
  /**
   * @param {any} text
   */
  setText(text) {
    this.text = text;
  }
}

export default Spinner;
