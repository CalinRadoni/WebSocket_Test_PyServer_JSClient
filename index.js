import { SettingsFormBuilder } from "./settings.js"

// var gwURL = `ws://${window.location.hostname}/ws`;
var gwURL = "ws://localhost:8001/";
var websocket;

const sfb = new SettingsFormBuilder(onSettingFormSubmit);

window.addEventListener('load', onLoad);

function onLoad(event) {
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
  console.log('ws connection opened');

  var path = window.location.pathname;
  var page = path.split("/").pop();
  if (page == 'settings.html') {
    websocket.send(JSON.stringify({ 'cmd': 'getSettings' }));
  }
}

function wsOnClose(event) {
  console.log('ws connection closed');
  setTimeout(wsConnect, 2000);
}

function wsOnMessage(event) {
  let jsonData = null;
  try {
    jsonData = JSON.parse(event.data);
  }
  catch (error) {
    console.log(`Failed to parse message as JSON: ${event.data}`);
  }

  if (jsonData !== null) {
    Object.keys(jsonData).forEach((key) => {
      let val = jsonData[key];
      switch (key) {
        case "time":
          document.getElementById('currentTime').innerHTML = val;
          break;
        case "settings":
          sfb.Build(val);
          break;
        default:
          console.log(`key: ${key}, value: ${val}`);
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
      websocket.send(JSON.stringify(obj));
    }
    else {
      logger('websocket is NOT connected !');
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
