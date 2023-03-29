/**
 * The only class exposed to the user.
 */

class ClientSuperClass{
    constructor(serverIP) {
        const test = 0;
        this.possibleEffects = {};
        this.normalizedTime = new NormalizedTime();
        this.eventEmitter = new EventEmitter();
        this.serverConnector = new ServerConnector(serverIP,this.normalizedTime, this.eventEmitter);
        if (this.serverConnector.isMainClient) {
          this.mainClient = new MainClient(this.normalizedTime, this.eventEmitter, this.possibleEffects);
        }
        this.effectQueue = new EffectQueue(this.normalizedTime, this.eventEmitter, this.possibleEffects);

        
        this.isMainClient = this.serverConnector.isMainClient;
      }

      
      /**
       * Sends effect command to server
       * @param {*} effectList list of effects to be executed
       * @param {*} repeat repeat effect n times
       * @param {*} startTime initial delay in seconds
       * @param {*} delay delay between effects in seconds
       */
      sendEffectCommand(effectList, repeat = 1, startTime = 1, delay = 0.5) {
        if (this.serverConnector.isMainClient){
          this.mainClient.sendEffectCommand(effectList, repeat, startTime, delay);
        }else{
          console.log("This client is not the main client. Please use the main client to send commands.");
        }
      }

      sendSyncTimeCommand() {
        this.serverConnector.sendSyncTimeCommand();
      }

      addPossibleEffect(name, effect) {
        this.possibleEffects[name] = new Effect(effect);
      }
}