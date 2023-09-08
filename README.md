# WebSocket test

This repository contains a Python WebSocket server and a JavaScript client embedded in some sample HTML pages.

I have used these to build the `HTML` and `JavaScript` code for the embedded web server defined in `ESP32Board`. See [Bits and pieces](#bits-and-pieces) for more information.

## Initialize

```sh
#!/bin/bash

# create a virtual environment
python3 -m venv venv
# activate it
source  ./venv/bin/activate
# install websockets
pip3 install websockets
# check websockets
python3 -m websockets --version
# deactivate the virtual environment
deactivate
```

## The servers

### Run the servers

The script `runServer.sh` will automatically activate the virtual environment, if needed, before
starting the web and websocket servers.
It will also deactivate the virtual environment before exit, only if it activated the environment.

### Commands and messages

- The WebSocket server will periodically send its time to all connected clients using a JSON string like `{"time": "2023-09-05T20:43:57.208074Z"}`

- The WebSocket server responds to `{"cmd":"getSettings"}` with `{"settings": {"WiFi0": [{"legend": "WiFi configuration"}, {"id": "SSID0", ... `

## WebSocket clients

The clients should connect to the `"ws://localhost:8001/"` address.

## Bits and pieces

- the CSS file is from [CreamCSS](https://github.com/CalinRadoni/CreamCSS)
- the `html` and `js` files are from `ESP32Board` component. See [RobotT1](https://github.com/CalinRadoni/RobotT1) for usage information.

## License

This repository is licensed under the terms of the MIT License. See the [LICENSE](LICENSE) file, [MIT License](https://opensource.org/license/mit/)  on `opensource.org` or [MIT License](https://spdx.org/licenses/MIT.html) on `SPDX` site.
