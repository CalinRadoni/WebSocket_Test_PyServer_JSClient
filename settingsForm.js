export { SettingsForm };

class SettingsForm {
  constructor() {
    //
  }

  browserTimeZone = null;

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

  Build(jsonSettingsData) {
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
  }

  SetPasswordToggleButtons() {
    const buttons = document.querySelectorAll("[data-input");
    buttons.forEach(button => {
      button.onclick = () => {
        const elem = document.getElementById(button.dataset.input);
        if (elem) {
          if (elem.type == "password") {
            elem.type = "text";
            button.classList.add("active");
          }
          else {
            elem.type = "password";
            button.classList.remove("active");
          }
        }
      }
    });
  }

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
