import { SettingsFormBuilder } from "./settings.js"
import { Logger } from "./logger.js";

// var gwURL = `ws://${window.location.hostname}/ws`;
var gwURL = "ws://localhost:8001/";
var websocket;

const sfb = new SettingsFormBuilder(onSettingFormSubmit);
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
  wsConnect();
  initButtons();
}

function wsConnect() {
  websocket = new WebSocket(gwURL);
  websocket.onopen = wsOnOpen;
  websocket.onclose = wsOnClose;
  websocket.onmessage = wsOnMessage;
}

function wsOnOpen(event) {
  log.log('ws connection opened');

  var path = window.location.pathname;
  var page = path.split("/").pop();
  switch (page) {
    case 'index.html':
      log.log('requesting main page');
      websocket.send(JSON.stringify({ 'cmd': 'getMain' }));
      break;
    case 'settings.html':
      log.log('requesting settings');
      websocket.send(JSON.stringify({ 'cmd': 'getSettings' }));
      break;
    default:
      log.error('unknown page');
      break;
  }
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
    Object.keys(jsonData).forEach((key) => {
      let val = jsonData[key];
      switch (key) {
        case "time":
          let elem = document.getElementById('currentTime');
          if (elem != null) {
            elem.innerHTML = val;
          }
          break;
        case "settings":
          log.log('settings received');
          sfb.Build(val);
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
      log.err('websocket is NOT connected !');
    }
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
    logger('websocket is NOT connected !');
  }
}

function onClickBtnB(event) {
  if (websocket.readyState == websocket.OPEN) {
    let str = JSON.stringify({ 'cmd': 'buttonB' });
    websocket.send(str);
  }
  else {
    logger('websocket is NOT connected !');
  }
}
