import asyncio
import websockets
from datetime import datetime
import ntplib

class SyncServer:
    def __init__(self):
        self.clients = {}
        self.main_client = None

    async def register(self, websocket):
        self.clients[websocket] = {"time_offset": None, "is_main": False}

        if len(self.clients) == 1:
            self.main_client = websocket
            self.clients[websocket]["is_main"] = True

        await self.sync_time(websocket)

        try:
            async for message in websocket:
                await self.handle_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass

        del self.clients[websocket]
        print(f"Client {websocket.remote_address} disconnected")

        # Check if main client disconnected
        if websocket == self.main_client:
            print("Main client disconnected. Terminating server.")
            await asyncio.sleep(1)
            raise KeyboardInterrupt


    async def sync_time(self, websocket):
        await websocket.send("$REQUEST_TIME")

        # Get NTP server time
        ntp_client = ntplib.NTPClient()
        response = ntp_client.request('pool.ntp.org')
        ntp_time = response.tx_timestamp

        # Send NTP time to client and wait for response
        await websocket.send(str(ntp_time))
        print(str(ntp_time))
        client_time = float(await websocket.recv())
        print(str(client_time))

        # Calculate the time offset for the client
        time_offset = client_time - ntp_time + 2208988800 # NTP vs UNIX time offset
        self.clients[websocket]["time_offset"] = time_offset

        print(f"Client {websocket.remote_address} synced with time offset: {time_offset}")

        # send the offset timecode to the client
        await websocket.send(f'$YOUR_OFFSET {str(time_offset)}')
 
    async def unregister(self, websocket):
        del self.clients[websocket]
        print(f"Client {websocket.remote_address} disconnected")

        # Check if main client disconnected
        if websocket == self.main_client:
            print("Main client disconnected. Terminating server.")
            await asyncio.sleep(1)
            raise KeyboardInterrupt

    async def handle_message(self, websocket, message):
        print(f"Client {websocket.remote_address} sent message: {message}")
        if message == "$SYNC_TIME":
            # Handle client time sync requests here
            await self.sync_time(websocket)
        elif websocket == self.main_client:
            # Handle main client messages here
            await self.handle_main_client_message(message)
        else:
            print(f'Not handling client {websocket.remote_address} message: {message}')
            pass

    async def handle_main_client_message(self, message):
        parts = message.split(" ")

        if parts[0] == "$EFCT":
            # Extract the command and time of execution from the message
            command = parts[1]
            time_str = parts[2]

            # Calculate the time delay until execution
            time_of_execution = float(time_str)
            await self.execute_effect(command, time_of_execution)

        else:
            print(f'Unknown command received from main client: {message}')

    async def execute_effect(self, command, timecode_norm):
        # Execute the effect here
        print(f"Executing effect: {command} at {timecode_norm}")

        # Broadcast the effect to all clients
        await self.broadcast(f"$EXEC_EFCT {command} {timecode_norm}")

    async def broadcast(self, message):
        # Broadcast a message to all connected clients
        for client in self.clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                print(f"Client {client.remote_address} disconnected. Removing from client list.")
                del self.clients[client]

    async def run(self, host, port):
        async with websockets.serve(self.register, host, port):
            print(f"Sync server started on {host}:{port}")

            try:
                await asyncio.Future()  # Run forever
            except KeyboardInterrupt:
                print("Server terminated")

server = SyncServer()
asyncio.run(server.run("localhost", 42187))
