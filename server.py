#!/usr/bin/env python

import asyncio
import datetime
import json
import websockets
import logging

logging.basicConfig()
logging.getLogger().setLevel(logging.INFO)

clients = set()

settingsD = dict()

async def broadcast_time():
    while True:
        message = datetime.datetime.utcnow().isoformat() + "Z"
        out_object = {
            "time": message
        }
        websockets.broadcast(clients, json.dumps(out_object))
        await asyncio.sleep(1)

async def handle_clients(websocket):
    global clients

    logging.info(f"New client requests {websocket.path}")

    try:
        # add the new client
        clients.add(websocket)
        logging.info(f'Client added, count is {len(clients)}')

        # process client messages
        async for message in websocket:
            data = json.loads(message)
            if 'cmd' in data:
                logging.info(f"Received command {data['cmd']}")
                if data['cmd'] == 'getSettings':
                    sss = dict()
                    sss['settings'] = settingsD
                    await websocket.send(json.dumps(sss))

    finally:
        clients.remove(websocket)
        logging.info(f'Client removed, count is {len(clients)}')

def buildSettingsDict():
    formatStringIP = "((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$"

    settingsD['WiFi0'] = [
        {'legend':'WiFi configuration'},
        {'id':'SSID0', 'label':'SSID',      'val':'firstSSID'},
        {'id':'Pass0', 'label':'Password',  'val':'firstPass'},
        {'val':'Leave the next fields empty if the address is assigned through DHCP'},
        {'id':'IP0',   'label':'Static IP', 'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'},
        {'id':'Mask0', 'label':'Mask',      'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'},
        {'id':'GW0',   'label':'Gateway',   'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'},
        {'id':'DNS0',  'label':'DNS',       'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'}
    ]
    settingsD['WiFi1'] = [
        {'legend':'Alternate WiFi configuration'},
        {'id':'SSID1', 'label':'SSID', 'val':'firstSSID'},
        {'id':'Pass1', 'label':'Password', 'val':'firstPass'},
        {'val':'Leave the next fields empty if the address is assigned through DHCP'},
        {'id':'IP1', 'label':'Static IP', 'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'},
        {'id':'Mask1', 'label':'Mask', 'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'},
        {'id':'GW1', 'label':'Gateway', 'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'},
        {'id':'DNS1', 'label':'DNS', 'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'}
    ]
    settingsD['Name'] = [
        {'legend':'Name'},
        {'id':'deviceName', 'label':'Device name', 'val':'ESP32 Device'},
        {'id':'mDNS', 'label':'mDNS name', 'val':'mDNSnamezzz'}
    ]
    settingsD['NTP'] = [
        {'legend':'Time'},
        {'id':'srvNTP', 'label':'NTP Server', 'val':'pool.ntp.org'},
        {'id':'gmtOffset', 'label':'GMT offset [s]', 'val':7200},
        {'id':'daylightOffset', 'label':'Daylight offset [s]', 'val':3600}
    ]
    settingsD['Telegram'] = [
        {'legend':'Telegram'},
        {'id':'chatID', 'label':'Chat ID', 'val':'123'},
        {'id':'botName', 'label':'Bot name', 'val':'bbbbbbb'},
        {'id':'botToken', 'label':'Bot token', 'val':'ttttttttttttttt'}
    ]

async def handle_ws_clients():
    async with websockets.serve(handle_clients, "localhost", 8001):
        await asyncio.Future() # run forever

async def main():
    buildSettingsDict()

    await asyncio.gather(
        broadcast_time(),
        handle_ws_clients()
    )

if __name__ == "__main__":
    asyncio.run(main())
