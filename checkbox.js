export { CheckboxHandler };

class CheckboxHandler {
  id = "";
  deps = [];
  reversed = false;

  constructor(id, deps, reversed = false) {
    this.id = id;
    this.deps = deps;
    this.reversed = reversed;
  }

  bind() {
    const elem = document.getElementById(this.id);
    if (!elem) {
      console.error(`Failed to get element with id ${this.id}`);
      return;
    }
    elem.addEventListener("change", this);
  }

  // the function name must remain unchanged
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#the_event_listener_callback
  handleEvent(event) {
    const chk = document.getElementById(this.id);
    if (!chk) {
      console.error(`Failed to get element with id ${this.id}`);
      return;
    }

    switch (event.type) {
      case "change":
        this.deps.forEach(dName => {
          const elem = document.getElementById(dName);
          if (elem)
            elem.disabled = this.reversed ? !chk.checked : chk.checked;
        });
        break;
      default:
        break;
    }
  }

  dispatchEvent(event) {
    const elem = document.getElementById(this.id);
    if (elem)
      elem.dispatchEvent(event);
  }
}
