class ServerConnector {

    constructor(serverAddress, normalizedTime) {
      this.ws = new WebSocket(serverAddress); 
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onopen = this.handleOpen.bind(this);

      this.normalizedTime = normalizedTime;
    }
  
    handleMessage(event) {
      const message = event.data;
      console.log(`Received message: ${message}`);
  
      if (message.startsWith("$EXEC_EFCT")) {
        this.eventEmitter.emit("effect", message);
      }
  
      if (message.startsWith("$REQUEST_TIME")) {
        const localTime = Date.now() / 1000;
        this.ws.send(localTime);
      }
  
      if (message.startsWith("$YOUR_OFFSET")) {
        const clientOffset = parseFloat(message.split(" ")[1]);
        this.normalizedTime.setOffset(clientOffset);
      }
    }

    handleEffectCommand(message) {
      //This must be passed to main class (EffectServer) and from there passed to EffectQueue
    }
  
    handleOpen(event) {
      console.log("WebSocket opened");
    }

    sendSyncTimeCommand() {
      const message = "$SYNC_TIME";
      console.log(`Sending message: ${message}`);
      this.ws.send(message);
    }
  
    // Effects need access
    
    
    // To be externalized to main client file
    sendEffectCommand(effectList, repeat = 1, startTime = 1, delay = 0.5) {
      if (typeof effectList === "string") {
        effectList = [effectList];
      }
  
      const timeOfExecution = this.getNormalizedTime();
  
      for (let i = 0; i < repeat * effectList.length; i++) {
        const message = `$EFCT ${effectList[i % effectList.length]} ${timeOfExecution + startTime + i * delay}`;
        console.log(`Sending message: ${message}`);
        this.ws.send(message);
      }
    }
  }
  