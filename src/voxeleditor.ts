import * as vscode from "vscode";
import * as path from "path";

export class VoxelEditor {
    private _webView: vscode.WebviewPanel;
    private _extContext: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this._extContext = context;

        this._webView = vscode.window.createWebviewPanel(
            "voxelEditor",
            "Voxel Editor",
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        // Handle messages from the webview
        this._webView.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case "echo":
                        vscode.window.showInformationMessage("Echo: " + message.toString());
                        return;
                }
            },
            undefined,
            /* TODO: Should this be undefined?*/
            undefined
        );

        // Construct the first Webview contents
        this._renderVoxel();
    }

    public getWebView(): vscode.WebviewPanel {
        return this._webView;
    }

    public postMessage(message: object): void {
        this._webView.webview.postMessage(message);
    }

    private _renderVoxel() {
        // Get the current text editor
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            // TODO: What's behavior if we have no active text editor?
            return;
        }

        // let doc = editor.document;

        // Only update status if a Voxel Markdown file
        // if (doc.languageId === "voxel-markdown") {}
        // let docContent = doc.getText();


        let docContent =
        `
        {
            "scene": "City Scene",
            "size": {
                "x": 100,
                "y": 100,
                "z": 100
            },
            "components": [{
                "name": "building",
                "voxels": [{
                    "rgb": "32CD32",
                    "a": 0.9,
                    "size": 1,
                    "pos": {
                        "x": 5,
                        "y": 6,
                        "z": 9
                    }
                }]
            }]
        }
        `;

        // TODO: Add JSON schema validation
        // TODO: Parse this into a structured class
        let voxelScene : VoxelScene = JSON.parse(docContent);
        this._webView.webview.html = this._createHtml(voxelScene.scene);

        for (let componentIndex in voxelScene.components) {
            let component = voxelScene.components[componentIndex];
            
            for (let voxelIndex in component.voxels) {
                let voxel = component.voxels[voxelIndex];
                let message : object = {
                    'command': 'voxel',
                    'voxel': JSON.stringify(voxel)
                };
                this.postMessage(message);
            }
        }
        
    }

    private _createHtml(title: string): string {
        this._webView.title = title;
        console.log("Creating html for " + title);

        // The script to handle drawing voxels and receiving messages
        const jsPath = path.join(
            this._extContext.extensionPath,
            "src",
            "web",
            "voxel.js"
        );

        // Get path to resource on disk
        const jsFile = vscode.Uri.file(jsPath);

        // And get the special URI to use with the webview
        const jsSrc = jsFile.with({ scheme: "vscode-resource" });

        // Same with support Libraries
        const voxelEditorPath = path.join(
            this._extContext.extensionPath,
            "src",
            "web",
            "VoxelEditor.js"
        );
        const voxelEditorFile = vscode.Uri.file(voxelEditorPath);
        const voxelEditorSrc = voxelEditorFile.with({
            scheme: "vscode-resource"
        });

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${this._webView.title}</title>
        </head>
        <!-- Default padding offsets -->
        <body style="padding:0px;overflow:hidden;">
            <!-- External Libaries -->
            <script src="https://threejs.org/build/three.js"></script>
            <script src="https://threejs.org/examples/js/controls/TrackballControls.js"></script>
            <!-- Internal Libaries -->
            <script src=${voxelEditorSrc}></script>
            <!-- Entry Point -->
            <script src=${jsSrc}></script>
            
        </body>
        </html>`;
    }

    dispose() {
        this._webView.dispose();
    }
}

// Interfaces

interface Position {
    x: number;
    y: number;
    z: number;
}

interface Voxel {
    rgb: string;
    a: number;
    pos: Position;
    size: number;
}

interface Component {
    name: string;
    voxels: Voxel[];
}

interface VoxelScene {
    scene: string;
    size: object;
    components: Component[];
}
