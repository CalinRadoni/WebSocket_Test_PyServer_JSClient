import { getWebsocketURL } from "./common.js";
import { Logger } from "./logger.js";

var websocket;

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

  log.log('requesting main page');
  websocket.send(JSON.stringify({ 'cmd': 'getMain' }));
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
        case 'status':
          Build(val);
          break;
        default:
          log.warn(`received ${key} key`);
          break;
      }
    })
  }
}

function initButtons() {
  let btn = document.getElementById('btnTestA');
  if (btn != null)
    btn.addEventListener('click', onClickBtnA);

  btn = document.getElementById('btnTestB');
  if (btn != null)
    btn.addEventListener('click', onClickBtnB);
}

function onClickBtnA(event) {
  if (websocket.readyState == websocket.OPEN) {
    let str = JSON.stringify({ 'cmd': 'buttonA' });
    websocket.send(str);
  }
  else {
    logger('websocket is NOT connected!');
  }
}

function onClickBtnB(event) {
  if (websocket.readyState == websocket.OPEN) {
    let str = JSON.stringify({ 'cmd': 'buttonB' });
    websocket.send(str);
  }
  else {
    logger('websocket is NOT connected!');
  }
}

function Build(jsonSettingsData) {
  //INFO: build the page based on the received data
}
