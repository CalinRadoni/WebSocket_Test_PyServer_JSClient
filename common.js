export { getWebsocketURL };

function getWebsocketURL() {
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
