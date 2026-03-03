export { GetWebsocketURL, BuildTopMenu };

const top_menu_id = "topmenu";
const map = new Map();
map.set("Home", "index.html");
map.set("Settings", "settings.html");
map.set("About", "about.html");

function GetWebsocketURL()
{
  const wlh = window.location.hostname;

  // these are mostly for development
  // works for WebSocket_Test_PyServer_JSClient
  if (wlh === '127.0.0.1')
    return "ws://127.0.0.1:8001/";
  if (wlh === 'localhost')
    return "ws://localhost:8001/";

  // this is the default link, like when the websockets server
  // is hosted on a ESP32
  return `ws://${window.location.hostname}/ws`;
}

function BuildTopMenu()
{
  const nav = document.getElementById("topmenu");
  if (!nav) {
    console.error(`nav ${top_menu_id} not found`);
    return;
  }

  map.forEach((value, key, map) => {
    let link = document.createElement("a");
    link.setAttribute("href", value);
    let text = document.createTextNode(key);
    link.appendChild(text);
    nav.appendChild(link);
  })
}
