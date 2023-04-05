export class ServerConnector {
  constructor(serverIP, port, normalizedTime, eventEmitter) {
    this.ws = this.connectWebsocket(serverIP, port);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onopen = this.handleOpen.bind(this);

    this.normalizedTime = normalizedTime;
    this.eventEmitter = eventEmitter;
    this.isMainClient = true;

    this.eventEmitter.on("sendEffectCommand", (message) => {
      this.sendMessage(message);
    });
  }

  connectWebsocket(ip, port = 42187) {
    var wssadress = "wss://" + ip + ":" + port;
    var wsadress = "ws://" + ip + ":" + port;
  
    var websocket;
    try {
      console.log("Trying to connect with wss", wssadress);
      websocket = new WebSocket(wssadress);
    } catch (e) {
      console.log("Error connecting with wss:", e);
    }
    
    if (!websocket || websocket.readyState !== 1) {
      try {
        console.log("Trying to connect with ws", wsadress);
        websocket = new WebSocket(wsadress);
      } catch (e) {
        console.log("Error connecting with ws:", e);
      }
    }
  
    return websocket;
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

      if(message.startsWith("$YOU_ARE_MAIN_CLIENT")){
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
  