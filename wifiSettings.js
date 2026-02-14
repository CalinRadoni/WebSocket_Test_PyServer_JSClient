/**
 * @file {@link AddWiFiFields} adds the fields to set a WiFi connection.
 * 
 * For now the fields are:
 * - SSID and password
 * - a checkbox to use DHCP or assign IP address manually
 * - fields for IPv4 address, mask, gateway and DNS server
 * 
 * @version 1.1.0
 * @copyright Calin Radoni 2026 {@link https://github.com/CalinRadoni}
 * @license MIT License
 */

export { AddWiFiFields };

const inputFieldType = Object.freeze({
  text: Symbol("text"),
  password: Symbol("password"),
  ip: Symbol("ip"),
  bssid: Symbol("bssid")
});

/**
 * ^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$
 * is a regular expresion to validate IPv4 addresses. I use this one because is *easy* to understand.
 */
const IP_pattern = "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$";
const IP_placeholder = "xxx.xxx.xxx.xxx";

const BSSID_pattern = "^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$";
const BSSID_placeholder = "xx:xx:xx:xx:xx:xx";

function AddLegend(parent, displayText) {
  const legend = document.createElement("legend");
  const text = document.createTextNode(displayText);
  legend.appendChild(text);
  parent.appendChild(legend);
}

function AddInputField(parent, divId, displayText, id, fieldType) {
  const div = document.createElement("div");
  if (divId) {
    div.setAttribute("id", divId);
  }

  let elem = document.createElement("label");
  elem.setAttribute("for", id);
  let text = document.createTextNode(displayText);
  elem.appendChild(text);
  div.appendChild(elem);

  elem = document.createElement("input");
  elem.setAttribute("type", "text");
  elem.setAttribute("id", id);
  elem.setAttribute("value", "");

  switch (fieldType) {
    case inputFieldType.password:
      elem.setAttribute("type", "password");
      break;
    case inputFieldType.ip:
    elem.setAttribute("pattern", IP_pattern);
    elem.setAttribute("placeholder", IP_placeholder);
      break;
    case inputFieldType.bssid:
      elem.setAttribute("pattern", BSSID_pattern);
      elem.setAttribute("placeholder", BSSID_placeholder);
      break;
  }

  div.appendChild(elem);

  parent.appendChild(div);
}

function AddCheckbox(parent, displayText, id, noteText) {
  const div = document.createElement("div");

  let elem = document.createElement("input");
  elem.setAttribute("type", "checkbox");
  elem.setAttribute("id", id);
  div.appendChild(elem);

  elem = document.createElement("label");
  elem.setAttribute("for", id);
  let text = document.createTextNode(displayText);
  elem.appendChild(text);
  div.appendChild(elem);

  if (noteText != null) {
    if (noteText.length > 0) {
      elem = document.createElement("p");
      elem.setAttribute("style", "margin-top: -0.5rem");

      text = document.createTextNode(noteText);
      elem.appendChild(text);
      div.appendChild(elem);
    }
  }

  parent.appendChild(div);
}

function AddWiFiFields(index) {
  const bName = "WiFiCfg" + index;

  const fs = document.getElementById(bName);
  if (!fs) {
    console.error(`Fieldset ${bName} not found !`);
    return;
  }

  AddInputField(fs, null, "SSID",  bName + "SSID", inputFieldType.text);
  AddInputField(fs, null, "Pass",  bName + "Pass", inputFieldType.password);
  AddInputField(fs, null, "BSSID", bName + "BSSID", inputFieldType.bssid);

  AddCheckbox(fs, "Use DHCP", bName + "UseDHCP", "Most of the time the addresses are set using DHCP");

  const div = document.createElement("div");
  div.setAttribute("id", bName + "DHCPdiv");
  fs.appendChild(div);

  AddInputField(div, null, "IPv4",    bName + "IPv4", inputFieldType.ip);
  AddInputField(div, null, "Mask",    bName + "Mask", inputFieldType.ip);
  AddInputField(div, null, "Gateway", bName + "Gateway", inputFieldType.ip);
  AddInputField(div, null, "DNS 1",   bName + "srvDNS1", inputFieldType.ip);
  AddInputField(div, null, "DNS 2",   bName + "srvDNS2", inputFieldType.ip);
}
