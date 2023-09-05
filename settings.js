export { SettingsFormBuilder };

class SettingsFormBuilder {
  constructor(settingFormSubmit) {
    this.settingFormSubmit = settingFormSubmit;
  }

  #AddInputField(ds, inputData) {
    if (inputData.constructor != Object) {
      console.error("The input data should be an object");
      return;
    }

    let nodeElem;
    let nodeText;

    if (inputData.hasOwnProperty('legend')) {
      nodeElem = document.createElement("legend");
      nodeText = document.createTextNode(inputData['legend']);
      nodeElem.appendChild(nodeText);
      ds.appendChild(nodeElem);
      return;
    }

    if (!(inputData.hasOwnProperty('val'))) {
      console.error("The field must have a 'val' property !");
      return;
    }

    const fieldVal = inputData['val'];

    const nodeDiv = document.createElement("div");

    if (inputData.hasOwnProperty('id')) {
      // this is an input field
      const fieldID = inputData['id'];

      if (inputData.hasOwnProperty('label')) {
        nodeElem = document.createElement("label");
        nodeElem.setAttribute("for", fieldID);
        nodeText = document.createTextNode(inputData['label']);
        nodeElem.appendChild(nodeText);
        nodeDiv.appendChild(nodeElem);
      }
      else {
        console.warn("No label specified for %s", inputData['id']);
      }

      nodeElem = document.createElement("input");
      nodeElem.setAttribute("type", "text");
      nodeElem.setAttribute("name", fieldID);
      nodeElem.setAttribute("value", fieldVal);
      if (inputData.hasOwnProperty('fmt')) {
        nodeElem.setAttribute("pattern", inputData['fmt']);
      }
      if (inputData.hasOwnProperty('hint')) {
        nodeElem.setAttribute("placeholder", inputData['hint']);
      }
      nodeDiv.appendChild(nodeElem);

      if (inputData.hasOwnProperty('msg')) {
        nodeElem = document.createElement("p");
        nodeText = document.createTextNode(inputData['msg']);
        nodeElem.appendChild(nodeText);
        nodeDiv.appendChild(nodeElem);
      }
    }
    else {
      // this is text only
      nodeElem = document.createElement("p");
      nodeText = document.createTextNode(fieldVal);
      nodeElem.appendChild(nodeText);
      nodeDiv.appendChild(nodeElem);
    }

    ds.appendChild(nodeDiv);
  }

  #AddFieldset(ds, key, inputData) {
    const nodeElem = document.createElement("fieldset");

    if (!(Array.isArray(inputData))) {
      console.error(`The input data for ${key} should be an array !`)
      return;
    }

    inputData.forEach((elem) => {
      this.#AddInputField(nodeElem, elem);
    });

    ds.appendChild(nodeElem);
  }

  #AddFormButtons(ds) {
    const nodeFs = document.createElement("fieldset");

    let nodeElem;
    let nodeText;

    nodeElem = document.createElement("button");
    nodeElem.setAttribute("type", "button");
    nodeText = document.createTextNode("Save");
    nodeElem.appendChild(nodeText);
    nodeElem.addEventListener('click', this.settingFormSubmit);
    nodeFs.appendChild(nodeElem);

    nodeElem = document.createElement("button");
    nodeElem.setAttribute("type", "reset");
    nodeText = document.createTextNode("Reset");
    nodeElem.appendChild(nodeText);
    nodeFs.appendChild(nodeElem);

    ds.appendChild(nodeFs);
  }

  Build(jsonSettingsData) {
    let ds = document.getElementById('settings');
    if (!ds) {
      console.error('settings form not found !');
      return;
    }

    while (ds.firstChild) {
      ds.removeChild(ds.firstChild);
    }

    if (jsonSettingsData.constructor != Object) {
      console.log("The input data should be an object");
      return;
    }

    for (const [key, value] of Object.entries(jsonSettingsData)) {
      this.#AddFieldset(ds, key, value);
    }

    this.#AddFormButtons(ds);
  }

  ParseNode(node, outObj) {
    if (node.tagName == 'INPUT') {
      let key = node.name.trim();
      if (key.length > 0) {
        outObj[key] = node.value.trim();
      }

      return;
    }

    if (node.children.length > 0) {
      for (const child of node.children) {
        this.ParseNode(child, outObj);
      }
    }
  }

  Save(outObj) {
    let ds = document.getElementById('settings');
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
