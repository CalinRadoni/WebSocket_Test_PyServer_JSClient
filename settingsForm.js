/**
 * @file {@link settingsForm} manage a form with dynamic content.
 * 
 * A button will get a data-controls attribute if 'controls' is set
 * elements with data-show are shown / hidden
 * elements with data-disable are enabled / disabled
 * 
 * An element will get a 'data-id' and 'data-group' attributes if is part of a "data/object group"
 * 
 * @version 4.2.0
 * @copyright Calin Radoni 2026 {@link https://github.com/CalinRadoni}
 * @license MIT License
 */

export { SettingsForm };

/**
 * ^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$
 * is a regular expresion to validate IPv4 addresses. I use this one because is *easy* to understand.
 */
const IP_pattern = "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$";
const IP_placeholder = "xxx.xxx.xxx.xxx";

const BSSID_pattern = "^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$";
const BSSID_placeholder = "xx:xx:xx:xx:xx:xx";

const svgNS = "http://www.w3.org/2000/svg";

const arrow_btn_href = "#svg-arrow-right";
const arrow_btn_class = "arrow";
const arrow_btn_open_class = "arrow-open";

const eye_btn_href = "#svg-eye";
const eye_btn_class = "eye";
const eye_btn_on_class = "eye-on";

class SettingsForm {
  constructor() {
    //
  }

  browserTimeZone = null;

  #AddFieldset(parent, entryObject)
  {
    if (entryObject.constructor != Object) {
      console.error("Data must be an object");
      return;
    }

    const fs = document.createElement("fieldset");
    if (entryObject.id) 
      fs.setAttribute("id", entryObject.id);
    if (entryObject.show)
      fs.dataset.show = entryObject.show;
    const groupID = entryObject.gid;

    if (entryObject.fields) {
      entryObject.fields.forEach(entry => {
        this.#AddEntry(fs, entry, groupID);
      });
    }

    parent.appendChild(fs);
  }

  #AddLegend(parent, entryObject)
  {
    if (entryObject.constructor != Object) {
      console.error("Data must be an object");
      return;
    }

    const div = document.createElement("div");
    div.classList.add("legend");
    if (entryObject.show)
      div.dataset.show = entryObject.show;

    if (entryObject.collapsible > 0) {
      const button = document.createElement("button");
      button.setAttribute("type", "button");
      if (entryObject.controls)
        button.dataset.controls = entryObject.controls;
      if (entryObject.open)
        button.dataset.open = Number(entryObject.open) > 0 ? 1 : 0;
      else button.dataset.open = 0;
      button.classList.add(arrow_btn_class);

      const bsvg = document.createElementNS(svgNS, "svg");
      const buse = document.createElementNS(svgNS, "use");
      buse.setAttribute("href", arrow_btn_href);
      bsvg.appendChild(buse);
      button.appendChild(bsvg);
      
      this.#ChangeArrowButton(button);

      div.appendChild(button);
    }

    const legend = document.createElement("legend");
    const text = document.createTextNode(entryObject.text);
    legend.appendChild(text);

    div.appendChild(legend);

    parent.appendChild(div);
  }

  #AddTextEntry(parent, entryObject, gid)
  {
    if (!gid) gid = "";

    const elemID = gid + entryObject.id;

    const label = document.createElement("label");
    label.setAttribute("for", elemID);
    if (entryObject.show)
      label.dataset.show = entryObject.show;
    let text = document.createTextNode(entryObject.text);
    label.appendChild(text);
    parent.appendChild(label);

    const div = document.createElement("div");
    if (entryObject.show)
      div.dataset.show = entryObject.show;

    const elem = document.createElement("input");
    elem.setAttribute("type", entryObject.type);
    elem.setAttribute("id", elemID);
    elem.dataset.id = entryObject.id;
    if (gid)
      elem.dataset.group = gid;

    switch (entryObject.type) {
      case "password":
        elem.setAttribute("spellcheck", "false");
        elem.setAttribute("autocomplete", "current-password");
        elem.setAttribute("autocapitalize", "none");
        break;
      case "ip":
        elem.setAttribute("type", "text");
        elem.setAttribute("pattern", IP_pattern);
        elem.setAttribute("placeholder", IP_placeholder);
        break;
      case "bssid":
        elem.setAttribute("type", "text");
        elem.setAttribute("pattern", BSSID_pattern);
        elem.setAttribute("placeholder", BSSID_placeholder);
        break;
    }

    if (entryObject.disable)
      elem.dataset.disable = entryObject.disable;

    div.appendChild(elem);

    if (entryObject.type == "password") {
      const button = document.createElement("button");
      button.setAttribute("type", "button");
      button.dataset.eye = elemID;
      button.classList.add(eye_btn_class);

      const bsvg = document.createElementNS(svgNS, "svg");
      const buse = document.createElementNS(svgNS, "use");
      buse.setAttribute("href", eye_btn_href);
      bsvg.appendChild(buse);
      button.appendChild(bsvg);

      if (entryObject.disable)
        button.dataset.disable = entryObject.disable;

      div.appendChild(button);
    }

    parent.appendChild(div);
  }

  #AddCheckbox(parent, entryObject, gid)
  {
    if (!gid) gid = "";

    const elemID = gid + entryObject.id;

    const div = document.createElement("div");
    div.classList.add("gc2");
    if (entryObject.show)
      div.dataset.show = entryObject.show;

    const elem = document.createElement("input");
    elem.setAttribute("type", "checkbox");
    elem.setAttribute("id", elemID);
    elem.dataset.id = entryObject.id;
    if (gid)
      elem.dataset.group = gid;
    if (entryObject.controls)
      elem.dataset.controls = entryObject.controls;
    if (entryObject.disable)
      elem.dataset.disable = entryObject.disable;
    if (entryObject.discheck)
      elem.dataset.discheck = entryObject.discheck;
    div.appendChild(elem);

    const label = document.createElement("label");
    label.setAttribute("for", elemID);
    const text = document.createTextNode(entryObject.text);
    label.appendChild(text);
    div.appendChild(label);

    parent.appendChild(div);
  }

  #AddButton(parent, entryObject, gid)
  {
    if (!gid) gid = "";

    const button = document.createElement("button");
    button.setAttribute("type", entryObject.type);
    if (entryObject.id)
      button.setAttribute("id", entryObject.id);
    if (entryObject.controls)
      button.dataset.controls = entryObject.controls;
    if (entryObject.disable)
      button.dataset.disable = entryObject.disable;
    if (entryObject.discheck)
      button.dataset.discheck = entryObject.discheck;

    const text = document.createTextNode(entryObject.text);
    button.appendChild(text);

    parent.appendChild(button);
  }

  #AddButtons(parent, entryObject, gid)
  {
    if (!gid) gid = "";

    const div = document.createElement("div");
    div.classList.add("gc2");
    div.classList.add("buttons");
    if (entryObject.show)
      div.dataset.show = entryObject.show;

    if (entryObject.buttons) {
      entryObject.buttons.forEach(entry => {
        this.#AddEntry(div, entry, gid);
      });
    }

    parent.appendChild(div);
  }

  #AddRadioGroup(parent, entryObject, gid)
  {
    if (!gid) gid = "";

    const elemID = gid + entryObject.id;
    const radioName = entryObject.name;

    const label = document.createElement("label");
    if (entryObject.id)
      label.setAttribute("for", elemID);
    if (entryObject.show)
      label.dataset.show = entryObject.show;
    const text = document.createTextNode(entryObject.text);
    label.appendChild(text);
    parent.appendChild(label);

    const div = document.createElement("div");
    if (entryObject.id)
      div.setAttribute("id", elemID);
    if (entryObject.show)
      div.dataset.show = entryObject.show;

    if (entryObject.options) {
      entryObject.options.forEach(entry => {
        entry.type = "radio";
        entry.name = radioName;
        this.#AddRadio(div, entry, gid);
      });
    }

    parent.appendChild(div);
  }

  #AddRadio(parent, entryObject, gid)
  {
    if (!gid) gid = "";

    const elemID = gid + entryObject.id;

    const div = document.createElement("div");

    const elem = document.createElement("input");
    elem.setAttribute("type", entryObject.type);
    elem.setAttribute("id", elemID);
    elem.setAttribute("name", entryObject.name);
    elem.dataset.id = entryObject.id;
    if (gid)
      elem.dataset.group = gid;
    if (entryObject.controls)
      elem.dataset.controls = entryObject.controls;
    if (entryObject.disable)
      elem.dataset.disable = entryObject.disable;
    if (entryObject.discheck)
      elem.dataset.discheck = entryObject.discheck;
    div.appendChild(elem);
    
    const label = document.createElement("label");
    label.setAttribute("for", elemID);
    const text = document.createTextNode(entryObject.text);
    label.appendChild(text);
    div.appendChild(label);

    parent.appendChild(div);
  }

  #AddSelect(parent, entryObject, gid)
  {
    if (!gid) gid = "";

    const elemID = gid + entryObject.id;

    const label = document.createElement("label");
    label.setAttribute("for", elemID);
    if (entryObject.show)
      label.dataset.show = entryObject.show;
    let text = document.createTextNode(entryObject.text);
    label.appendChild(text);
    parent.appendChild(label);

    const elem = document.createElement("select");
    elem.setAttribute("id", elemID);
    if (entryObject.show)
      elem.dataset.show = entryObject.show;
    if (entryObject.disable)
      elem.dataset.disable = entryObject.disable;
    elem.dataset.id = entryObject.id;
    if (gid)
      elem.dataset.group = gid;

    parent.appendChild(elem);
  }

  #AddEntry(parent, entry, gid)
  {
      const entryType = entry.type;
      if (!entryType) {
        console.error('Each entry must have a "type" key!');
        return;
      }

      switch (entryType) {
        case "fieldset":
          this.#AddFieldset(parent, entry);
          break;
        case "legend":
          this.#AddLegend(parent, entry);
          break;
        case "text":
        case "password":
        case "bssid":
        case "ip":
        case "email":
        case "date":
        case "time":
          this.#AddTextEntry(parent, entry, gid);
          break;
        case "checkbox":
          this.#AddCheckbox(parent, entry, gid);
          break;
        case "button":
          this.#AddButton(parent, entry, gid);
          break;
        case "buttons":
          this.#AddButtons(parent, entry, gid);
          break;
        case "radio":
          this.#AddRadio(parent, entry, gid);
          break;
        case "radiogroup":
          this.#AddRadioGroup(parent, entry, gid);
          break;
        case "select":
          this.#AddSelect(parent, entry, gid);
          break;
        default:
          console.error(`Unknown entry type: ${entryType} !`);
      }
  }

  /**
   * Add JS functions to handle on-click event for all HTML elements
   * with 'data-controls' or 'data-eye' attributes
   */
  #SetVisibilityToggleButtons() {
    const passwordButtons = document.querySelectorAll("[data-eye]");
    passwordButtons.forEach(button => {
      button.onclick = () => {
        let passField = document.getElementById(button.dataset.eye);
        if (passField) {
          if (passField.type == "password") {
            passField.type = "text";
            button.classList.add(eye_btn_on_class);
          }
          else {
            passField.type = "password";
            button.classList.remove(eye_btn_on_class);
          }
        }
      }
    });

    const buttons = document.querySelectorAll("[data-controls]");
    buttons.forEach(button => {
      if (button.type == 'checkbox' || button.type == 'radio') {
        button.onchange = () => {
          let disableOnCheck = button.dataset.discheck;
          let disableValue = disableOnCheck ? button.checked : !button.checked;

          let elems = document.querySelectorAll(`[data-show="${button.dataset.controls}"]`);
          elems.forEach(elem => {
            if (disableValue) {
              if(!elem.classList.contains("hide")) {
                elem.classList.add("hide");
              }
            }
            else {
              if(elem.classList.contains("hide")) {
                elem.classList.remove("hide");
              }
            }
          });

          elems = document.querySelectorAll(`[data-disable="${button.dataset.controls}"]`);
          elems.forEach(elem => {
            elem.disabled = disableValue;
          });
        }
      }

      if (button.type == 'button') {
        button.onclick = () => {
          button.dataset.open = button.dataset.open > 0 ? 0 : 1;
          this.#ChangeArrowButton(button);

          let elems = document.querySelectorAll(`[data-show="${button.dataset.controls}"]`);
          elems.forEach(elem => {
            if (button.dataset.open > 0) {
              elem.classList.remove("hide");
            }
            else {
              elem.classList.add("hide");
            }
          });
        }
      }
    });
  }

  BuildTheForm(parentFormID, jsonData)
  {
    const form = document.getElementById(parentFormID);
    if (!form) {
      console.error(`The form with ${parentFormID} ID is not found!`);
      return;
    }

    if (!Array.isArray(jsonData)) {
      console.error('Data must be array!');
      return;
    }

    jsonData.forEach(entry => {
      this.#AddEntry(form, entry, null);
    });

    this.#SetVisibilityToggleButtons();

    this.DispatchChangeEvent();
  }

  #SetOptionState(node, tzName) {
    if (node.nodeName == 'OPTION') {
      node.selected = node.value == tzName;
      if (node.selected)
        this.tzSelected = true;
      return;
    }

    node.childNodes.forEach(child => {
      this.#SetOptionState(child, tzName);
    });
  }

  #SetFieldValue(id, value, dGroup, dID) {
    const elem = document.getElementById(id);
    if (!elem) {
      console.error(`Element with id ${id} not found!`);
      return;
    }

    if (elem.nodeName == 'SELECT') {
      this.#SetOptionState(elem, value);
      return;
    }

    if (elem.type == 'checkbox' || elem.type == 'radio') {
      elem.checked = value.toLowerCase() === 'true';
    }
    else {
      elem.value = value;
    }

    if (dGroup && dID) {
      elem.dataset.group = dGroup;
      elem.dataset.id = dID;
    }
  }

  #SetFieldsFromObject(name, object) {
    if (object.constructor != Object) {
      console.error(`The value of ${name} should be an object!`);
      return;
    }

    Object.keys(object).forEach(key => {
      const val = object[key];
      const fieldID = name + key;
      this.#SetFieldValue(fieldID, val, name, key);
    });
  }

  /**
   * Set the values of the form's input fields
   * 
   * @param {*} jsonSettingsData 
   */
  SetValues(jsonSettingsData)
  {
    const ds = document.getElementById('settings');
    if (!ds) {
      console.error('Settings form not found!');
      return;
    }

    this.tzSelected = false;

    if (jsonSettingsData.constructor != Object) {
      console.error("The input data should be an object");
      return;
    }
    Object.keys(jsonSettingsData).forEach(key => {
      const val = jsonSettingsData[key];
      if (val.constructor == Object) {
        this.#SetFieldsFromObject(key, val);
      }
      else {
        this.#SetFieldValue(key, val);
      }
    });

    if (!this.tzSelected) {
      this.#SetOptionState(ds, this.browserTimeZone ? this.browserTimeZone : "UTC");
    }

    this.DispatchChangeEvent();
  }

  #ChangeArrowButton(button)
  {
    if (!button) return;

    const svg = button.getElementsByTagNameNS(svgNS, "svg");
    if (svg.length == 0) return;
    
    if (button.dataset.open > 0) {
      svg[0].classList.add(arrow_btn_open_class);
    }
    else {
      svg[0].classList.remove(arrow_btn_open_class);
    }
  }

  /**
   * Send change event to all buttons with 'data-controls' attribute
   * to update the state of elements those are controling
   */
  DispatchChangeEvent()
  {
    const event = new Event('change');
  
    const buttons = document.querySelectorAll("[data-controls]");
    buttons.forEach(button => {
      if (button.type == 'button') {
        button.dataset.open = button.dataset.open > 0 ? 1 : 0;
        this.#ChangeArrowButton(button);
        let elems = document.querySelectorAll(`[data-show="${button.dataset.controls}"]`);
        elems.forEach(elem => {
          if (button.dataset.open > 0) {
            elem.classList.remove("hide");
          }
          else {
            elem.classList.add("hide");
          }
        });
      }
      else {
        button.dispatchEvent(event);
      }
    });
  }

  /**
   * Create a JSON object from the input fields found on the form
   * 
   * HTML's data-group = JS's dataset.group = object's name
   * 
   * @param {*} node = the childs of this element are parsed
   * @param {*} outObj = this is the JSON object that will be constructed
   */
  ParseNode(node, outObj) {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input

    if (node.nodeName == 'INPUT' || node.nodeName == 'SELECT') {
      const key = node.id;
      if (key.length > 0) {
        let val;
        if (node.type == 'checkbox' || node.type == 'radio') {
          val = node.checked ? 'true' : 'false';
        }
        else {
          val = node.value;
        }

        if (node.dataset.group && node.dataset.id) {
          if (!outObj[node.dataset.group]) {
            outObj[node.dataset.group] = {};
          }
          outObj[node.dataset.group][node.dataset.id] = val;
        }
        else {
          outObj[key] = val;
        }
      }

      return;
    }

    node.childNodes.forEach(child => {
      this.ParseNode(child, outObj);
    });
  }

  Save(outObj) {
    const ds = document.getElementById('settings');
    if (!ds) {
      console.error('Settings form not found!');
      return;
    }
    if (!ds.hasChildNodes()) {
      console.warn('No child nodes ! Nothing to save.')
      return;
    }

    this.ParseNode(ds, outObj);
  }
};
