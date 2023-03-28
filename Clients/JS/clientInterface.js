
// Initialize WebSocket connection
const ws = new WebSocket("ws://192.168.178.42:42187");

// Queue of effects to execute
const effectQueue = [];
let effectCount = 0;

// Handle incoming messages
ws.onmessage = (event) => {
    const message = event.data;
    console.log(`Received message: ${message}`);

    if (message.startsWith("$EXEC_EFCT")) {
        // Extract effect and timecode from message
        const parts = message.split(" ");
        const effect = parts[1];
        const timecode = parseFloat(parts[2]);

        // Add effect to queue
        effectQueue.push({ effect, timecode });
        effectCount++;

        console.log(`${getNormalizedTime()}: Added effect ${effectCount}: ${effect} to queue. Executing at ${timecode}`);
    }

    // Initalize time offset
    if (message.startsWith("$REQUEST_TIME")) {
        const localTime = Date.now() / 1000;
        ws.send(localTime)
    }

    // Set client time offset
    if (message.startsWith("$YOUR_OFFSET")) {
        // Extract client time offset from message
        const clientOffset = parseFloat(message.split(" ")[1]);
        localStorage.setItem("timeOffset", clientOffset.toString());
        console.log(`Set client timeoffset to: ${clientOffset}`);
    }
};

ws.onopen = function (event) {
    console.log("WebSocket opened");
};

// Start executing effects from queue
setInterval(() => {
    const currentTime = getNormalizedTime(); // Get current time
    document.getElementById("time").innerHTML = currentTime; // Update time display

    // execute effects from queue
    while (effectQueue && effectQueue.length > 0 && effectQueue[0].timecode < currentTime) {
        const { effect, timecode } = effectQueue.shift(); // Get effect from queue
        console.log(`Executing effect ${effect}; Intended time: ${timecode}, Actual time: ${currentTime}, Difference: ${currentTime - timecode}; System time: ${Date.now() / 1000}`); // Some logging

        // Execute effect
        if (effect == "strobeOn") {
            strobeOn();
        } else if (effect == "strobeOff") {
            document.body.style.background = "white";
        }

        console.log(effectQueue);
    }
}, 1); // Check every millisecond for new effects to execute



// Function to send an effect command to the server
function sendEffectCommand(effectList, repeat = 1, startTime = 1, delay = 0.5) {
    // if effecct_list is a string, convert it to a list
    if (typeof effectList == "string") {
        effectList = [effectList];
    }
    const timeOfExecution = getNormalizedTime();

    for (let i = 0; i < (repeat * effectList.length); i++) {
        // for each element in the list, send a message

        const message = `$EFCT ${effectList[i % effectList.length]} ${timeOfExecution + startTime + i * delay}`;
        console.log(`Sending message: ${message}`);
        ws.send(message);
    }
    console.log(`Sending message: ${message}`);
    ws.send(message);
}

// Function to send a sync time command to the server
function sendSyncTimeCommand() {
    const message = "$SYNC_TIME";
    console.log(`Sending message: ${message}`);
    ws.send(message);
}

function getNormalizedTime() {
    return Date.now() / 1000 + parseFloat(localStorage.getItem("timeOffset"));
}
