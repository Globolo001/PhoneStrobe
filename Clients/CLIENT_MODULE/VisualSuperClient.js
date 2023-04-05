import {ServerConnector} from './ServerConnector.js';
import {NormalizedTime}from './NormalizedTime.js';
import {MainClient }from './MainClient.js';
import {EffectQueue }from './EffectQueue.js';
import { EventEmitter} from './EventEmitter.js';
import {Effect} from './Effect.js';


/**
 * The only class exposed to the user.
 */


export default class VisualSuperClient{
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
        }else{
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
