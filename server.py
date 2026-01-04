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
        # message = datetime.datetime.utcnow().isoformat() + "Z"
        message = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
        out_object = {
            "time": message
        }
        websockets.broadcast(clients, json.dumps(out_object))
        await asyncio.sleep(1)

async def handle_clients(serverConn):
    global clients

    logging.info(f"New client requests {serverConn.remote_address}")

    try:
        # add the new client
        clients.add(serverConn)
        logging.info(f'Client added, count is {len(clients)}')

        # process client messages
        async for message in serverConn:
            data = json.loads(message)
            if 'cmd' in data:
                logging.info(f"Received command {data['cmd']}")
                if data['cmd'] == 'getSettings':
                    sss = dict()
                    sss['settings'] = settingsD
                    await serverConn.send(json.dumps(sss))
                if data['cmd'] == 'setSettings':
                    if 'data' in data:
                        for key, value in data['data'].items():
                            logging.info(f"{key}: {value}")
                    else:
                        logging.info('no data ?')

    finally:
        clients.remove(serverConn)
        logging.info(f'Client removed, count is {len(clients)}')

def buildSettingsDict():
    # [Validating IPv4 addresses with regexp](https://stackoverflow.com/a/36760050)
    # ^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$
    # \ are escaped
    formatStringIP = "^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$"

    settingsD['WiFi0'] = [
        {'type':'legend', 'val':'WiFi configuration'},
        {'type':'text', 'id':'SSID0', 'label':'SSID', 'val':'Home_SSID'},
        {'type':'password', 'id':'Pass0', 'label':'Password', 'val':'Password1!'},
        {'type':'text', 'id':'IP0',   'label':'IPv4',    'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'},
        {'type':'text', 'id':'Mask0', 'label':'Mask',    'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'},
        {'type':'text', 'id':'GW0',   'label':'Gateway', 'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'},
        {'type':'text', 'id':'DNS0',  'label':'DNS',     'val':'', 'fmt':formatStringIP, 'hint':'xxx.xxx.xxx.xxx'},
        {'type':'hint', 'val':'Leave IPv4, Mask, Gateway and DNS empty when those are assigned through DHCP'}
    ]
    settingsD['TestFields'] = [
        {'type':'legend', 'val':'Test fields'},
        {'type':'email', 'id':'email0', 'label':'e-mail', 'val':''},
        {'type':'date', 'id':'dateS', 'label':'date', 'val':''},
        {'type':'time', 'id':'timeS', 'label':'time', 'val':''},
        {'type':'checkbox', 'id':'chk0', 'label':'A checkbox', 'val':'chk0'},
        {'type':'checkbox', 'id':'chk1', 'label':'Another checkbox', 'val':'chk1'},
        {'type':'label', 'val':'Choose an option:'},
        {'type':'radio', 'id':'ro0', 'name':'radiob', 'label':'First option', 'val':'ro0'},
        {'type':'radio', 'id':'ro1', 'name':'radiob', 'label':'Second option', 'val':'ro1'},
        {'type':'radio', 'id':'ro2', 'name':'radiob', 'label':'Third option', 'val':'ro2'}
    ]
    settingsD['Name'] = [
        {'type':'legend', 'val':'Name'},
        {'type':'text', 'id':'deviceName', 'label':'Device name', 'val':'ESP32 Device'},
        {'type':'text', 'id':'mDNS', 'label':'mDNS name', 'val':'mDNSname'}
    ]
    settingsD['NTP'] = [
        {'type':'legend', 'val':'Time'},
        {'type':'text', 'id':'srvNTP', 'label':'NTP Server', 'val':'pool.ntp.org'},
        {'type':'number', 'id':'gmtOffset', 'label':'GMT offset [s]', 'val':7200},
        {'type':'number', 'id':'daylightOffset', 'label':'Daylight offset [s]', 'val':3600}
    ]
    settingsD['Telegram'] = [
        {'type':'legend', 'val':'Telegram'},
        {'type':'text', 'id':'chatID', 'label':'Chat ID', 'val':'123'},
        {'type':'text', 'id':'botName', 'label':'Bot name', 'val':'bbbbbbb'},
        {'type':'text', 'id':'botToken', 'label':'Bot token', 'val':'ttttttttttttttt'}
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
