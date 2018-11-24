(function () {
    // TODO: Make this a compiled Typescript file
    const vscode = acquireVsCodeApi();

    console.log("Constructing VoxelEditor...");
    var voxelSize = 50;
    var editor = new VoxelEditor(document.body, voxelSize);
    editor.RenderScene();
    console.log("Constructed VoxelEditor!");

    // Handle the message inside the webview
    window.addEventListener("message", event => {
        const message = event.data; // The JSON data our extension sent
        console.log("Received message " + message);
        switch (message.command) {
            case "display":
                let display = document.getElementById("display");
                display.textContent = message.text;
                break;
            case "echo":
                vscode.postMessage(message);
                break;
            case "voxel":
                editor.AddVoxel(message.voxel);
                break;
        }
    });
})();
