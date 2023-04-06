export class ServerConnector {
  constructor(serverIP, port, normalizedTime, eventEmitter) {
    this.normalizedTime = normalizedTime;
    this.eventEmitter = eventEmitter;
    this.isMainClient = true;

    this.eventEmitter.on("sendEffectCommand", (message) => {
      this.sendMessage(message);
    });

    this.connectWebsocket(serverIP, port);
  }

  bindWebsocketEvents() {
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onopen = this.handleOpen.bind(this);
  }

  connectWebsocket(ip, port = 42187) {
    const wssAddress = "wss://" + ip + ":" + port;
    const wsAddress = "ws://" + ip + ":" + port;

    console.log("Trying to connect with wss", wssAddress);
    this.ws = new WebSocket(wssAddress);

    this.ws.addEventListener("error", (e) => {
      console.log("Error connecting with wss:", e);
      console.log("Trying to connect with ws", wsAddress);
      const ws = new WebSocket(wsAddress);

      ws.addEventListener("error", (e) => {
        console.log("Error connecting with ws:", e);
      });

      ws.addEventListener("open", () => {
        console.log("Connected successfully with WS (no SSL)");
        this.ws = ws;
        this.bindWebsocketEvents();
      });
    });

    this.ws.addEventListener("open", () => {
      console.log("Connected successfully with WSS (SSL/TLS)");
      this.bindWebsocketEvents();
    });
  }


  handleMessage(event) {
    const message = event.data;
    console.log(`Received message: ${message}`);

    if (message.startsWith("$EXEC_EFCT")) {
      this.eventEmitter.emit("receiveEffectCommand", message);
    }

    if (message.startsWith("$REQUEST_TIME")) {
      this.sendMessage(Date.now() / 1000);
    }

    if (message.startsWith("$YOU_ARE_MAIN_CLIENT")) {
      this.isMainClient = true;
    }

    if (message.startsWith("$YOUR_OFFSET")) {
      const clientOffset = parseFloat(message.split(" ")[1]);
      this.normalizedTime.setOffset(clientOffset);
    }
  }

  handleOpen(event) {
    console.log("WebSocket opened: " + event);
  }

  sendSyncTimeCommand() {
    this.sendMessage("$SYNC_TIME");
  }

  sendMessage(message) {
    console.log(`Sending message: ${message}`);
    this.ws.send(message);
  }
}
