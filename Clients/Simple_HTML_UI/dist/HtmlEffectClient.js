class ServerConnector {
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

class NormalizedTime {
    getNormalizedTime() {
        return Date.now() / 1000 + parseFloat(localStorage.getItem("timeOffset"));
      }

    setOffset(offset) {
        localStorage.setItem("timeOffset", offset.toString());
    }
}

class MainClient {

    constructor(normalizedTime, eventEmitter, possibleEffects) {
        this.normalizedTime = normalizedTime;
        this.eventEmitter = eventEmitter;
        this.possibleEffects = possibleEffects;
    }

    sendEffectCommand(effectList, repeat = 1, startTime = 1, delay = 0.5) {
        if (typeof effectList === "string") {
          effectList = [effectList];
        }
    
        const timeOfExecution = this.normalizedTime.getNormalizedTime();
    
        for (let i = 0; i < repeat * effectList.length; i++) {

            // check if effect is in possible effects which is a dictionary
            if ((effectList[i % effectList.length] in this.possibleEffects)) {
                const message = `$EFCT ${effectList[i % effectList.length]} ${timeOfExecution + startTime + i * delay}`;
                this.eventEmitter.emit("sendEffectCommand", message);
            } else {
                console.log(`MainClientError: Effect ${effectList[i % effectList.length]} is not a possible effect to send.`);
            }
        }
      }
}

class EffectQueue{

    constructor(normalizedTime, eventEmitter, possibleEffects){
        this.effectQueue = [];
        this.effectCount = 0;
        this.eventEmitter = eventEmitter;
        this.possibleEffects = possibleEffects;

        this.normalizedTime = normalizedTime;
        setInterval(this.executeEffects.bind(this), 1);

        this.eventEmitter.on("receiveEffectCommand", (message) => {
            this.handleEffectCommand(message);
        });
    }

    executeEffects() {
        const currentTime = this.normalizedTime.getNormalizedTime();
        document.getElementById("time").innerHTML = currentTime;
    
        while (this.effectQueue.length > 0 && this.effectQueue[0].timecode < currentTime) {
          const { effectObject, timecode } = this.effectQueue.shift();
          console.log(`Executing effect ${effectObject}; Intended time: ${timecode}, Actual time: ${currentTime}, Difference: ${currentTime - timecode}; System time: ${Date.now() / 1000}`);
    
          effectObject.execute();
        }
    }

    handleEffectCommand(message) {
        const parts = message.split(" ");
        const effect = parts[1];
        const timecode = parseFloat(parts[2]);
        this.addEffect(effect, timecode);
    }

    // This has to be called by main class (EffectServer)
    addEffect(effectName, timecode) {
        const effectObject = this.possibleEffects[effectName];
        if (effectObject) {
            this.effectQueue.push({effectObject, timecode });
            this.effectCount++;
        } else {
            console.log(`On execution: Effect ${effectName} not implemented on this client`);
        }
    }
}

// Custom event emitter class
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  emit(eventName, ...args) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((listener) => {
        listener(...args);
      });
    }
  }
}

class Effect {
    constructor(func = () => {console.log("Effect not implemented");}) {
        this.execute = func;
    }
}

/**
 * The only class exposed to the user.
 */


class VisualSuperClient{
    constructor(serverIP, port = 42187) {
        this._possibleEffects = {};
        this._normalizedTime = new NormalizedTime();
        this._eventEmitter = new EventEmitter();
        this._serverConnector = new ServerConnector(serverIP,port, this._normalizedTime, this._eventEmitter);
        if (this._serverConnector.isMainClient) {
          this._mainClient = new MainClient(this._normalizedTime, this._eventEmitter, this._possibleEffects);
        }
        this._effectQueue = new EffectQueue(this._normalizedTime, this._eventEmitter, this._possibleEffects);

        
        this.isMainClient = this._serverConnector.isMainClient;
      }

      
      /**
       * Sends effect command to server
       * @param {*} effectList list of effects to be executed
       * @param {*} repeat repeat effect n times
       * @param {*} startTime initial delay in seconds
       * @param {*} delay delay between effects in seconds
       */
      sendEffectCommand(effectList, repeat = 1, startTime = 1, delay = 0.5) {
        if (this._serverConnector.isMainClient){
          this._mainClient.sendEffectCommand(effectList, repeat, startTime, delay);
        }else {
          console.log("This client is not the main client. Please use the main client to send commands.");
        }
      }

      sendSyncTimeCommand() {
        this._serverConnector.sendSyncTimeCommand();
      }

      addPossibleEffect(name, effect) {
        this._possibleEffects[name] = new Effect(effect);
      }

      getPossibleEffects() {
        return this._possibleEffects;
      }

      getServerTime() {
        return this._normalizedTime.getServerTime();
      }
}

const clientInstance = new VisualSuperClient("localhost");

clientInstance.addPossibleEffect("strobeOn", () => {
    document.body.style.background = "black";
});

clientInstance.addPossibleEffect("strobeOff", () => {
    document.body.style.background = "white";
});

function sendEffectCommand(effectList, repeat = 1, startTime = 1, delay = 0.5) {
    clientInstance.sendEffectCommand(effectList, repeat, startTime, delay);
}

function sendSyncTimeCommand() {
    clientInstance.sendSyncTimeCommand();
}

sendEffectCommand(); // To keep them in the file
sendSyncTimeCommand();
