
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