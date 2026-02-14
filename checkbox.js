/**
 * @file {@link CheckboxHandler} Manage a HTML checkbox and associated elements
 * 
 * @version 1.3.0
 * @copyright Calin Radoni 2026 {@link https://github.com/CalinRadoni}
 * @license MIT License
 */

export { CheckboxHandler };

class CheckboxHandler {
  id = "";
  dElems = [];
  hElems = [];
  disableOnCheck = false;

  /**
   * @param {string} id - checkbox's id
   * @param {Array} dElems Array with id of elements to be enabled / disabled
   * @param {Array} hElems Array with id of elements to be shown / hidden
   * @param {boolean} disableOnCheck if true, check => (disable, hide)
   */
  constructor(id, dElems, hElems, disableOnCheck = true) {
    this.id = id;
    this.dElems = dElems;
    this.hElems = hElems;
    this.disableOnCheck = disableOnCheck;

    if (this.dElems == null) this.dElems = [];
    if (this.hElems == null) this.hElems = [];
  }

  /**
   * Add the event listener for the `change` event to checkbox
   */
  bind() {
    const elem = document.getElementById(this.id);
    if (!elem) {
      console.error(`Failed to get element with id ${this.id}`);
      return;
    }
    elem.addEventListener("change", this);
  }

  /**
   * Handle the events received from checkbox
   * 
   * @warning the function name must remain unchanged !
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener}
   * @param event The event sent by the HTML element
   */
  handleEvent(event) {
    const chk = document.getElementById(this.id);
    if (!chk) {
      console.error(`Failed to get element with id ${this.id}`);
      return;
    }

    switch (event.type) {
      case "change":
        const disableValue = this.disableOnCheck ? chk.checked : !chk.checked;

        this.dElems.forEach(eName => {
          const elem = document.getElementById(eName);
          if (elem)
            elem.disabled = disableValue;
        });

        this.hElems.forEach(eName => {
          const elem = document.getElementById(eName);
          if (elem)
            elem.style.display = disableValue ? 'none' : 'block';
        });
        break;

      default: break;
    }
  }
  
  /**
   * Set checked state
   */
  set(check) {
    const elem = document.getElementById(this.id);
    if (elem)
      elem.checked = check;
  }

  /**
   * Send an event to the checkbox.
   * This is usefull when changes are made that do not trigger events, like
   * from script and not from interface.
   * 
   * @example
   * const event = new Event('change');
   * ckhList.forEach(chk => chk.dispatchEvent(event));
   */
  dispatchEvent(event) {
    const elem = document.getElementById(this.id);
    if (elem)
      elem.dispatchEvent(event);
  }
}
