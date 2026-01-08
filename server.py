#!/usr/bin/env python

import asyncio
import datetime
import json
import websockets
import logging
import pytz
import random

logging.basicConfig()
logging.getLogger().setLevel(logging.INFO)

clients = set()

testData = []


async def broadcast_time():
    while True:
        message = datetime.datetime.now(datetime.UTC).isoformat() + "Z"
        out_object = {"time": message}
        websockets.broadcast(clients, json.dumps(out_object))
        await asyncio.sleep(1)


async def handle_clients(serverConn):
    global clients
    global testData

    logging.info(f"New client requests {serverConn.remote_address}")

    try:
        # add the new client
        clients.add(serverConn)
        logging.info(f"Client added, count is {len(clients)}")

        # process client messages
        async for message in serverConn:
            data = json.loads(message)
            if "cmd" in data:
                logging.info(f"Received command {data['cmd']}")
                if data["cmd"] == "getSettings":
                    randomizeSettings()
                    sss = dict()
                    sss["settings"] = testData
                    await serverConn.send(json.dumps(sss))
                if data["cmd"] == "setSettings":
                    if "data" in data:
                        for key, value in data["data"].items():
                            logging.info(f"{key}: {value}")
                    else:
                        logging.info("no data ?")

    finally:
        clients.remove(serverConn)
        logging.info(f"Client removed, count is {len(clients)}")


def getRandomTimeZone():
    tzList = pytz.common_timezones
    return random.choice(tzList)


def randomizeSettings():
    global testData
    for elem in testData:
        if elem["id"] == "tz":
            elem["val"] = getRandomTimeZone()


def buildSettings():
    global testData
    testData = [
        {"id": "deviceName", "val": "ESP32"},
        {"id": "mDNS", "val": ""},
        {"id": "w0SSID", "val": "Home_SSID"},
        {"id": "w0Pass", "val": "Password1!"},
        {"id": "w0UseDHCP", "val": "true"},
        {"id": "w0IP", "val": ""},
        {"id": "w0Mask", "val": ""},
        {"id": "w0GW", "val": ""},
        {"id": "w0DNS", "val": ""},
        {"id": "tz", "val": getRandomTimeZone()},
        {"id": "srvNTP", "val": "pool.ntp.org"},
    ]


async def handle_ws_clients():
    async with websockets.serve(handle_clients, "localhost", 8001):
        await asyncio.Future()  # run forever


async def main():
    buildSettings()

    await asyncio.gather(broadcast_time(), handle_ws_clients())


if __name__ == "__main__":
    asyncio.run(main())
