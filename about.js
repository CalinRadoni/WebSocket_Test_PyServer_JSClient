"use strict";

import { GetWebsocketURL, BuildTopMenu } from "./common.js";
import { SettingsForm } from "./settingsForm.js";
import { Logger } from "./logger.js";

var websocket;

const sfb = new SettingsForm();
const log = new Logger('log', 2500, 2500);

function setLogColors() {
  let styles = getComputedStyle(document.querySelector(':root'));
  let ct = styles.getPropertyValue('--c-txt');
  let ce = styles.getPropertyValue('--c-err');
  log.setColors(ct, ct, ce);
}

window.addEventListener('load', onLoad);

function onLoad(event) {
  setLogColors();
  BuildTopMenu();
  wsConnect();
}

function wsConnect() {
  const gwURL = GetWebsocketURL();
  websocket = new WebSocket(gwURL);
  websocket.onopen = wsOnOpen;
  websocket.onclose = wsOnClose;
  websocket.onmessage = wsOnMessage;
}

function wsOnOpen(event) {
  log.log('ws connection opened');

  log.log('requesting data');
  websocket.send(JSON.stringify({ 'cmd': 'getAbout' }));
}

function wsOnClose(event) {
  log.err('ws connection closed');
  setTimeout(wsConnect, 2000);
}

function wsOnMessage(event) {
  let jsonData;
  try {
    jsonData = JSON.parse(event.data);
  }
  catch (err) {
    log.err(`Failed to parse message as JSON: ${event.data}`);
    console.error(err);
    return;
  }

  Object.keys(jsonData).forEach(key => {
    const val = jsonData[key];
    switch (key) {
      case 'time':
        const elem = document.getElementById('currentTime');
        if (elem != null)
          elem.innerHTML = val;
        break;
      case 'about':
        sfb.BuildTheForm("info", val);
        break;
      case 'status':
        // handle command/request status response
        break;
      default:
        log.warn(`received ${key} key`);
        break;
    }
  });
}
