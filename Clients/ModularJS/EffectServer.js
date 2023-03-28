class EffectServer{
    constructor() {
        this.normalizedTime = new NormalizedTime();
        this.serverConnector = new ServerConnector(serverAddress,normalizedTime);
        this.serverConnector.handleEffectCommand = this.handleEffectCommand.bind(this);

        this.effectQueue = new EffectQueue(this.normalizedTime);
    }

    handleEffectCommand(message) {
        const parts = message.split(" ");
        const effect = parts[1];
        const timecode = parseFloat(parts[2]);

        this.effectQueue.addEffect(effect, timecode);
    }
}