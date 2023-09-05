import {SettingsFormBuilder} from "./settings.js"

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
      websocket.send(JSON.stringify({'cmd':'getSettings'}));
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
        // jsonData = JSON.parse('{"settings": {"WiFi0": [{"legend": "WiFi configuration"}, {"id": "SSID0", "label": "SSID", "val": "firstSSID"}, {"id": "Pass0", "label": "Password", "val": "firstPass"}, {"val": "Leave the next fields empty if the address is assigned through DHCP"}, {"id": "IP0", "label": "Static IP", "val": "", "fmt": "", "hint": "xxx.xxx.xxx.xxx", "msg":"Leave empty if address is assigned through DHCP"}, {"id": "Mask0", "label": "Mask", "val": "", "fmt": ""}, {"id": "GW0", "label": "Gateway", "val": ""}, {"id": "DNS0", "label": "DNS", "val": ""}], "WiFi1": [{"legend": "Alternate WiFi configuration"}, {"id": "SSID1", "label": "SSID", "val": "firstSSID"}, {"id": "Pass1", "label": "Password", "val": "firstPass"}, {"val": "Leave the next fields empty if the address is assigned through DHCP"}, {"id": "IP1", "label": "Static IP", "val": "", "hint": "xxx.xxx.xxx.xxx"}, {"id": "Mask1", "label": "Mask", "val": "", "hint": "xxx.xxx.xxx.xxx"}, {"id": "GW1", "label": "Gateway", "val": "", "hint": "xxx.xxx.xxx.xxx"}, {"id": "DNS1", "label": "DNS", "val": "", "hint": "xxx.xxx.xxx.xxx"}], "Name": [{"legend": "Name"}, {"id": "deviceName", "label": "Device name", "val": "ESP32 Device"}, {"id": "mDNS", "label": "mDNS name", "val": "mDNSnamezzz"}], "NTP": [{"legend": "Time"}, {"id": "srvNTP", "label": "NTP Server", "val": "pool.ntp.org"}, {"id": "gmtOffset", "label": "GMT offset [seconds]", "val": 7200}, {"id": "daylightOffset", "label": "Daylight offset", "val": 3600}], "Telegram": [{"legend": "Telegram"}, {"id": "chatID", "label": "Chat ID", "val": "123"}, {"id": "botName", "label": "Bot name", "val": "bbbbbbb"}, {"id": "botToken", "label": "Bot token", "val": "ttttttttttttttt"}]}}');
    }
    catch(error) {
        console.log(`Failed to parse message as JSON: ${event.data}`);
    }

    if (jsonData !== null) {
        Object.keys(jsonData).forEach((key) => {
            let val = jsonData[key];
            switch(key) {
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
    let str = JSON.stringify({'action':'btnA'});
    console.log(str);
    websocket.send(str);
}

function onClickBtnB(event) {
    let arr = [];
    for (let i = 0; i < 500; ++i) {
        arr.push({v: i});
    }
    let str = JSON.stringify(arr);
    console.log(str);
    websocket.send(str);
}
