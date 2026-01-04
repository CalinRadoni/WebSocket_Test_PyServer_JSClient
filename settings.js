export { SettingsFormBuilder };

class SettingsFormBuilder {
  constructor(settingFormSubmit) {
    this.settingFormSubmit = settingFormSubmit;
  }

  #AddLegend(parentNode, val) {
    let nodeElem = document.createElement("legend");
    let nodeText = document.createTextNode(val);
    nodeElem.appendChild(nodeText);
    parentNode.appendChild(nodeElem);
  }

  #AddHint(parentNode, val) {
    let nodeElem = document.createElement("p");
    let nodeText = document.createTextNode(val);
    nodeElem.appendChild(nodeText);
    parentNode.appendChild(nodeElem);
  }

  #AddLabel(parentNode, val) {
    let nodeElem = document.createElement("label");
    nodeElem.setAttribute("for", "");
    let nodeText = document.createTextNode(val);
    nodeElem.appendChild(nodeText);
    parentNode.appendChild(nodeElem);
  }

  #AddTextInputLabel(parentNode, id, val) {
    let nodeElem = document.createElement("label");
    nodeElem.setAttribute("for", id);
    let nodeText = document.createTextNode(val);
    nodeElem.appendChild(nodeText);
    parentNode.appendChild(nodeElem);
  }

  #AddTextInputField(parentNode, fieldType, val, id, name, fmt, hint) {
    let nodeElem = document.createElement("input");
    nodeElem.setAttribute("type", fieldType);
    nodeElem.setAttribute("id", id);
    nodeElem.setAttribute("name", name);
    nodeElem.setAttribute("value", val);
    if (fmt != null) {
      nodeElem.setAttribute("pattern", fmt);
    }
    if (hint != null) {
      nodeElem.setAttribute("placeholder", hint);
    }
    parentNode.appendChild(nodeElem);
  }

  #AddTextInput(parentNode, inputData, fieldType, fieldVal, fieldID) {
    let nodeDiv = document.createElement("div");

    // For radio buttons 'name' is the name of the radio group
    // ... not really needed by others
    let nodeName = inputData['name'];
    if (nodeName == null) {
      nodeName = fieldID;
    }

    let nodeLabel = inputData['label'];
    let fieldFmt = inputData['fmt'];
    let fieldHint = inputData['hint'];

    if (nodeLabel != null) {
      this.#AddTextInputLabel(nodeDiv, fieldID, nodeLabel);
    }
    else {
      console.warn("No label specified for %s", inputData['id']);
    }
    this.#AddTextInputField(nodeDiv, fieldType, fieldVal, fieldID, nodeName, fieldFmt, fieldHint);

    if (inputData.hasOwnProperty('msg')) {
      let nodeElem = document.createElement("p");
      let nodeText = document.createTextNode(inputData['msg']);
      nodeElem.appendChild(nodeText);
      nodeDiv.appendChild(nodeElem);
    }

    parentNode.appendChild(nodeDiv);
  }

  #AddTextInputRC(parentNode, inputData, fieldType, fieldVal, fieldID) {
    // For radio buttons 'name' is the name of the radio group
    // ... not really needed by others
    let nodeName = inputData['name'];
    if (nodeName == null) {
      nodeName = fieldID;
    }

    let nodeLabel = inputData['label'];
    let fieldFmt = inputData['fmt'];
    let fieldHint = inputData['hint'];

    this.#AddTextInputField(parentNode, fieldType, fieldVal, fieldID, nodeName, fieldFmt, fieldHint);
    if (nodeLabel != null) {
      this.#AddTextInputLabel(parentNode, fieldID, nodeLabel);
    }
    else {
      console.warn("No label specified for %s", fieldID);
    }

    parentNode.appendChild(document.createElement("br"));
  }

  #AddInputField(parentNode, inputData) {
    if (inputData.constructor != Object) {
      console.error("The input data should be an object");
      return;
    }

    if (!(inputData.hasOwnProperty('type'))) {
      console.error("The field must have a 'type' property !");
      return;
    }
    if (!(inputData.hasOwnProperty('val'))) {
      console.error("The field must have a 'val' property !");
      return;
    }

    const fieldType = inputData['type'];
    const fieldVal = inputData['val'];

    if (fieldType == 'legend') {
      this.#AddLegend(parentNode, fieldVal);
      return;
    }

    if (fieldType == 'hint') {
      this.#AddHint(parentNode, fieldVal);
      return;
    }

    if (fieldType == 'label') {
      this.#AddLabel(parentNode, fieldVal);
      return;
    }

    if (!(inputData.hasOwnProperty('id'))) {
      console.error("The field must have a 'id' property !");
      return;
    }
    const fieldID = inputData['id'];

    if (fieldType == 'text' || fieldType == 'password' ||
        fieldType == 'number' || fieldType == 'email' ||
        fieldType == 'date' || fieldType == 'time')
    {
      this.#AddTextInput(parentNode, inputData, fieldType, fieldVal, fieldID);
      return;
    }

    if (fieldType == 'checkbox' || fieldType == 'radio') {
      this.#AddTextInputRC(parentNode, inputData, fieldType, fieldVal, fieldID);
      return;
    }

    console.error("Unknown field type %s !", fieldType);
  }

  #AddFieldset(parentNode, key, inputData) {
    const nodeElem = document.createElement("fieldset");

    if (!(Array.isArray(inputData))) {
      console.error(`The input data for ${key} should be an array !`)
      return;
    }

    inputData.forEach((elem) => {
      this.#AddInputField(nodeElem, elem);
    });

    parentNode.appendChild(nodeElem);
  }

  #AddFormButtons(parentNode) {
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

    parentNode.appendChild(nodeFs);
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
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input

    if (node.tagName == 'INPUT') {
      let key = node.id.trim();
      if (key.length > 0) {
        let val;
        if (node.type == 'checkbox' || node.type == 'radio') {
          val = node.checked ? 1 : 0;
        }
        else {
          val = node.value.trim();
        }
        outObj[key] = val;
        console.log(key + ": " + val);
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
