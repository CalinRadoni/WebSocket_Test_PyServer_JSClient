export { Logger };

class Logger {
  constructor(logID, fadeMS, delayMS) {
    this.logID = logID;
    this.fadeMS = fadeMS;
    this.delayMS = delayMS;

    this.ct = "inherit";
    this.cw = "yellow";
    this.ce = "red";
  }

  setColors(ct, cw, ce) {
    this.ct = ct;
    this.cw = cw;
    this.ce = ce;
  }

  log(text) { this.#write(text, this.ct); }
  warn(text) { this.#write(text, this.cw); }
  err(text) { this.#write(text, this.ce); }

  #write(text, msgColor) {
    let elem = document.getElementById(this.logID);
    if (elem == null) return;

    elem.innerHTML = text;
    elem.style.transition = "opacity 0s 0s";
    elem.style.opacity = 1;
    elem.style.color = msgColor;

    let str = "opacity " + this.fadeMS + "ms ease-in " + this.delayMS + "ms";

    // Promise.resolve(...) worked ... most of the time :)
    setTimeout(() => {
      elem.style.transition = str;
      elem.style.opacity = 0;
    }, 0);
  }
};
