import { getWebsocketURL } from "./common.js";
import { SettingsForm } from "./settingsForm.js";
import { TimeZoneSort, TimeZones } from "./timeZones.js";
import { Logger } from "./logger.js";

var websocket;

/**
 * Note: for *booleans* (`collapsible`, `open`, ...) use 0 and >0
 * Do NOT use true, false and surelly not "false"
 * Search "Javascript boolean coercion" for information
 */
const JSONformDescription = 
`[
    {
        "type": "fieldset",
        "fields": [
            { "type": "text", "id": "deviceName", "text": "Device name" },
            { "type": "text", "id": "mDNSName", "text": "mDNS name" }
        ]
    },
    { "type": "legend", "text": "WiFi settings 1", "collapsible": 1, "controls": "wg0", "open": 1 },
    {
        "type": "fieldset",
        "show": "wg0",
        "gid": "WiFiCfg0",
        "fields": [
            { "type": "text", "id": "SSID", "text": "SSID" },
            { "type": "password", "id": "Pass", "text": "Password" },
            { "type": "bssid", "id": "BSSID", "text": "BSSID" },
            { "type": "checkbox", "id": "UseDHCP", "text": "Use DHCP",
                "info": "Most of the time the addresses are set using DHCP",
                "controls": "ws0", "discheck": true },
            { "type": "ip", "disable": "ws0", "id": "IPv4", "text": "IPv4" },
            { "type": "ip", "disable": "ws0", "id": "Mask", "text": "Mask" },
            { "type": "ip", "disable": "ws0", "id": "Gateway", "text": "Gateway" },
            { "type": "ip", "disable": "ws0", "id": "srvDNS1", "text": "DNS 1" },
            { "type": "ip", "disable": "ws0", "id": "srvDNS2", "text": "DNS 2" }
        ]
    },
    { "type": "legend", "text": "WiFi settings 2", "collapsible": 1, "controls": "wg1" },
    {
        "type": "fieldset",
        "show": "wg1",
        "gid": "WiFiCfg1",
        "fields": [
            { "type": "text", "id": "SSID", "text": "SSID" },
            { "type": "password", "id": "Pass", "text": "Password" },
            { "type": "bssid", "id": "BSSID", "text": "BSSID" },
            { "type": "checkbox", "id": "UseDHCP", "text": "Use DHCP",
                "info": "Most of the time the addresses are set using DHCP",
                "controls": "ws1", "discheck": true },
            { "type": "ip", "disable": "ws1", "id": "IPv4", "text": "IPv4" },
            { "type": "ip", "disable": "ws1", "id": "Mask", "text": "Mask" },
            { "type": "ip", "disable": "ws1", "id": "Gateway", "text": "Gateway" },
            { "type": "ip", "disable": "ws1", "id": "srvDNS1", "text": "DNS 1" },
            { "type": "ip", "disable": "ws1", "id": "srvDNS2", "text": "DNS 2" }
        ]
    },
    { "type": "legend", "text": "WiFi settings 3", "collapsible": 1, "controls": "wg2" },
    {
        "type": "fieldset",
        "show": "wg2",
        "gid": "WiFiCfg2",
        "fields": [
            { "type": "text", "id": "SSID", "text": "SSID" },
            { "type": "password", "id": "Pass", "text": "Password" },
            { "type": "bssid", "id": "BSSID", "text": "BSSID" },
            { "type": "checkbox", "id": "UseDHCP", "text": "Use DHCP",
                "info": "Most of the time the addresses are set using DHCP",
                "controls": "ws2", "discheck": true },
            { "type": "ip", "disable": "ws2", "id": "IPv4", "text": "IPv4" },
            { "type": "ip", "disable": "ws2", "id": "Mask", "text": "Mask" },
            { "type": "ip", "disable": "ws2", "id": "Gateway", "text": "Gateway" },
            { "type": "ip", "disable": "ws2", "id": "srvDNS1", "text": "DNS 1" },
            { "type": "ip", "disable": "ws2", "id": "srvDNS2", "text": "DNS 2" }
        ]
    },
    { "type": "legend", "text": "Time settings" },
    {
        "type": "fieldset",
        "fields": [
            { "type": "select", "id": "timeZone", "text": "Timezone" },
            { "type": "checkbox", "id": "chkNTP", "text": "Use NTP",
                "controls": "wsNTP" },
            { "type": "text", "disable": "wsNTP", "id": "srvNTP", "text": "NTP Server", "placeholder": "pool.ntp.org" }
        ]
    },
    { "type": "legend", "text": "Access Point Mode" },
    {
        "type": "fieldset",
        "fields": [
            { "type": "password", "id": "apPassword", "text": "Password" }
        ]
    },
    { "type": "legend", "text": "Telegram" },
    {
        "type": "fieldset",
        "fields": [
            { "type": "checkbox", "id": "chkTelegram", "text": "Use Telegram",
                "controls": "wsTelegram" },
            { "type": "text", "show": "wsTelegram", "id": "telegramChatID", "text": "Chat ID" },
            { "type": "text", "show": "wsTelegram", "id": "telegramBotName", "text": "Bot name" },
            { "type": "text", "show": "wsTelegram", "id": "telegramBotToken", "text": "Bod token" }
        ]
    },
    {
        "type": "fieldset",
        "fields": [
            { "type": "buttons", "buttons": [
                { "type": "button", "id": "btnSave", "text": "Save"},
                { "type": "button", "id": "btnReset", "text": "Reset"}
            ] }
        ]
    },
    { "type": "legend", "text": "Test fields" },
    {
        "type": "fieldset",
        "fields": [
            { "type": "email", "id": "email0", "text": "e-mail" },
            { "type": "date", "id": "dateS", "text": "date" },
            { "type": "time", "id": "timeS", "text": "time" },
            { "type": "radiogroup", "name": "radioBB", "text": "Choose an option:",
                "options": [
                    { "id": "ro0", "text": "First option" },
                    { "id": "ro1", "text": "Second option" },
                    { "id": "ro2", "text": "Third option" }
                ]
            }
        ]
    }
]`;

const sfb = new SettingsForm();
const log = new Logger('log', 2500, 2500);

const wifiCfgCnt = 3;

const ckhList = [];

function setLogColors() {
  let styles = getComputedStyle(document.querySelector(':root'));
  let ct = styles.getPropertyValue('--c-txt');
  let ce = styles.getPropertyValue('--c-err');
  log.setColors(ct, ct, ce);
}

window.addEventListener('load', onLoad);

function onLoad(event) {
  setLogColors();

  const jsonData = JSON.parse(JSONformDescription);
  sfb.BuildTheForm("settings", jsonData);

  initTZlist();
  initButtons();

  wsConnect();
}

function wsConnect() {
  const gwURL = getWebsocketURL();
  websocket = new WebSocket(gwURL);
  websocket.onopen = wsOnOpen;
  websocket.onclose = wsOnClose;
  websocket.onmessage = wsOnMessage;
}

function wsOnOpen(event) {
  log.log('ws connection opened');

  log.log('requesting settings');
  websocket.send(JSON.stringify({ 'cmd': 'getSettings' }));
}

function wsOnClose(event) {
  log.err('ws connection closed');
  setTimeout(wsConnect, 2000);
}

function wsOnMessage(event) {
  let jsonData = null;
  try {
    jsonData = JSON.parse(event.data);
  }
  catch (error) {
    log.err(`Failed to parse message as JSON: ${event.data}`);
  }

  if (jsonData !== null) {
    Object.keys(jsonData).forEach(key => {
      const val = jsonData[key];
      switch (key) {
        case 'time':
          const elem = document.getElementById('currentTime');
          if (elem != null)
            elem.innerHTML = val;
          break;
        case 'settings':
          log.log('settings received');
          sfb.SetValues(val);
          break;
        default:
          log.warn(`received ${key} key`);
          break;
      }
    })
  }
}

function onSettingFormSubmit() {
  let dataObj = {};
  sfb.Save(dataObj);
  if (Object.keys(dataObj).length > 0) {
    let obj = {};
    obj['cmd'] = 'setSettings';
    obj['data'] = dataObj;

    if (websocket.readyState == websocket.OPEN) {
      log.log('new settings sent');
      websocket.send(JSON.stringify(obj));
    }
    else {
      log.err('websocket NOT connected!');
    }
  }
}

function onSettingFormReset() {
  if (websocket.readyState == websocket.OPEN) {
    log.log('requesting settings');
    websocket.send(JSON.stringify({ 'cmd': 'getSettings' }));
  }
  else {
    log.err('websocket NOT connected!');
  }
}

function initTZlist() {
  const selectElem = document.getElementById('timeZone');
  if (!selectElem) return;

  while (selectElem.firstChild) {
    selectElem.removeChild(selectElem.lastChild);
  }

  const tzs = new TimeZones();
  tzs.Load(true, true);
  tzs.Sort(TimeZoneSort.ROL);
  const utz = tzs.GetCurrentTimeZone();

  sfb.browserTimeZone = utz;

  const groups = tzs.GroupTimeZones();
  Object.keys(groups).sort().forEach(region => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = region;

    groups[region].forEach(tz => {
      const option = document.createElement('option');
      option.value = tz.name;

      const optionText = document.createTextNode(tz.offset + ' ' + tz.location);
      option.appendChild(optionText);

      if (tz.name == utz)
        option.selected = true;

      optgroup.appendChild(option);
    });

    selectElem.appendChild(optgroup);
  });
}

function initButtons() {
  let elem = document.getElementById("btnSave");
  if (elem)
    elem.addEventListener('click', onSettingFormSubmit);

  elem = document.getElementById("btnReset");
  if (elem)
    elem.addEventListener('click', onSettingFormReset);
}
