const clientInstance = new ClientSuperClass("localhost");

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