
class EffectQueue{

    constructor(normalizedTime){
        this.effectQueue = [];
        this.effectCount = 0;

        this.normalizedTime = normalizedTime;
        setInterval(this.executeEffects.bind(this), 1);
    }

    executeEffects() {
        const currentTime = this.normalizedTime.getNormalizedTime();
        document.getElementById("time").innerHTML = currentTime;
    
        while (this.effectQueue.length > 0 && this.effectQueue[0].timecode < currentTime) {
          const { effect, timecode } = this.effectQueue.shift();
          console.log(`Executing effect ${effect}; Intended time: ${timecode}, Actual time: ${currentTime}, Difference: ${currentTime - timecode}; System time: ${Date.now() / 1000}`);
    
          /**
           * TODO make this as ob objects
           */
          if (effect === "strobeOn") {
            this.strobeOn();
          } else if (effect === "strobeOff") {
            this.strobeOff();
          }
        }
    }

    // This has to be called by main class (EffectServer)
    addEffect(effect, timecode) {
        this.effectQueue.push({ effect, timecode });
        this.effectCount++;
        const parts = message.split(" ");
    }
    

    // FOLLOWWING EFFECT METHODS MUST BE IMPLEMENTED BY SUBCLASS

    strobeOn() {
        // Throw error that this method is not implemented copilot?
        throw new Error("Method not implemented.");
    }

    strobeOn() {
        // Implementation of strobeOn method
        throw new Error("Method not implemented.");
    }
}