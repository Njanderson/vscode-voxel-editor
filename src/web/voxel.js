(function() {
  // TODO: Make this a compiled Typescript file
  const vscode = acquireVsCodeApi();

  // Handle the message inside the webview
  window.addEventListener("message", event => {
    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
      case "display":
        let display = document.getElementById("display");
        display.textContent = message.text;
        break;
      case "echo":
        vscode.postMessage(message);
        break;
      case "voxel":
        break;
    }
  });

  console.log("Constructing VoxelEditor...");
  var voxelSize = 50;
  var editor = new VoxelEditor(voxelSize);
  editor.RenderScene(document.body);
  console.log("Constructed VoxelEditor!");
})();
