import { getWebsocketURL } from "./common.js";
import { SettingsForm } from "./settingsForm.js";
import { AddWiFiFields } from "./wifiSettings.js";
import { CheckboxHandler } from "./checkbox.js";
import { TimeZoneSort, TimeZones } from "./timeZones.js";
import { Logger } from "./logger.js";

var websocket;

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

  addWiFiSettings();
  initCheckboxes();
  initTZlist();
  initButtons();

  sfb.SetPasswordToggleButtons();

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
          sfb.Build(val);
          dispatchChangeEvent();
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

function dispatchChangeEvent() {
  const event = new Event('change');

  ckhList.forEach(chk => chk.dispatchEvent(event));
}

function addWiFiSettings() {
  for (let i = 0; i < wifiCfgCnt; ++i) {
    let elem = document.getElementById("w" + i + "Settings");
    if (elem) {
      elem.open = i == 0 ? true : false;
    }

    AddWiFiFields(i);
  }
}

function initCheckboxes() {
  const ckhw0 = new CheckboxHandler('WiFiCfg0UseDHCP', null, ['WiFiCfg0DHCPdiv'], true);
  const ckhw1 = new CheckboxHandler('WiFiCfg1UseDHCP', null, ['WiFiCfg1DHCPdiv'], true);
  const ckhw2 = new CheckboxHandler('WiFiCfg2UseDHCP', null, ['WiFiCfg2DHCPdiv'], true);

  const ckhNTP = new CheckboxHandler('chkNTP', ['srvNTP'], ['divNTP'], false);
  const ckhTelegram = new CheckboxHandler('chkTelegram',
    ['telegramChatID', 'telegramBotName', 'telegramBotToken'], ['tlgD0', 'tlgD1', 'tlgD2'], false);

  ckhList.push(ckhw0);
  ckhList.push(ckhw1);
  ckhList.push(ckhw2);
  ckhList.push(ckhNTP);
  ckhList.push(ckhTelegram);

  // the Telegram functionality is not implemented yet
  let elem = document.getElementById('chkTelegram');
  if (elem) {
    elem.checked = false;
    elem.disabled = true;
  }

  ckhList.forEach(chk => chk.bind());

  ckhw0.set(true);
  ckhw1.set(true);
  ckhw2.set(true);
  ckhNTP.set(true);
  dispatchChangeEvent();
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
