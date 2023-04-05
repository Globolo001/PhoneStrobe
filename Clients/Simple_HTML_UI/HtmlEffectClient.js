import VisualSuperClient from "../CLIENT_MODULE/VisualSuperClient.js";

const clientInstance = new VisualSuperClient("kleukerstinkt.me");

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

sendEffectCommand; // To keep them in the file
sendSyncTimeCommand;