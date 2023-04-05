export class MainClient {

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