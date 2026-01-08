export { SettingsForm };

class SettingsForm {
  constructor() {
    //
  }

  #SetOptionState(node, tzName) {
    if (node.nodeName == 'OPTION') {
      node.selected = node.value == tzName;
      return;
    }

    node.childNodes.forEach(child => {
      this.#SetOptionState(child, tzName);
    });
  }

  #SetFieldValue(id, value) {
    const elem = document.getElementById(id);
    if (!elem) {
      console.error(`Element with id ${id} not found !`);
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
  }

  Build(jsonSettingsData) {
    const ds = document.getElementById('settings');
    if (!ds) {
      console.error('settings form not found !');
      return;
    }

    if (!(Array.isArray(jsonSettingsData))) {
      console.error(`The input data should be an array !`)
      return;
    }

    // set input fields
    jsonSettingsData.forEach(elem => {
      if (elem.constructor != Object) {
        console.error("The input data should be an object");
        return;
      }

      if (!(elem.hasOwnProperty('id'))) {
        console.error("The object must have a 'id' property !");
        return;
      }
      if (!(elem.hasOwnProperty('val'))) {
        console.error("The object must have a 'val' property !");
        return;
      }

      this.#SetFieldValue(elem['id'], elem['val']);
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
        outObj[key] = val;

        console.log(key + ": " + val);
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
      console.error('settings form not found !');
      return;
    }
    if (!ds.hasChildNodes()) {
      console.warn('No child nodes ! Nothing to save.')
      return;
    }

    this.ParseNode(ds, outObj);
  }
};
