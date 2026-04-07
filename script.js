let camera = document.getElementById("camera");
let streaming = false;
let streamInterval;

// Start camera
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camera.srcObject = stream;
}

startCamera();

// Convert video frame → base64
function getFrame() {
    const canvas = document.createElement("canvas");
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(camera, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.6); // compress
}

// Send frame to server
async function sendFrame() {
    if (!streaming) return;

    const frame = getFrame();

    await fetch("/frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: frame })
    });

    document.getElementById("status").innerText = "Status: Streaming...";
}

// Start streaming
document.getElementById("startBtn").onclick = () => {
    streaming = true;
    streamInterval = setInterval(sendFrame, 300); // send every 300 ms
};

// Stop streaming
document.getElementById("stopBtn").onclick = () => {
    streaming = false;
    clearInterval(streamInterval);
    document.getElementById("status").innerText = "Status: Stopped";
};

