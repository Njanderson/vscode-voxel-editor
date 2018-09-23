import * as vscode from 'vscode';

export class VoxelEditor {

    private _webView : vscode.WebviewPanel;

    constructor() {
        this._webView = vscode.window.createWebviewPanel(
            'voxelEditor',
            "Voxel Editor",
            vscode.ViewColumn.One,
            {}
        );

        // Handle messages from the webview
        this._webView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showErrorMessage(message.text);
                    return;
            }
        }, undefined, context.subscriptions);
    }

    public getWebView() : vscode.WebviewPanel {
        return this._webView;
    }

    public renderVoxel() {
        // Get the current text editor
        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;

        // Only update status if a Voxel Markdown file
        // if (doc.languageId === "voxel-markdown") {}
        let docContent = doc.getText();

        // TODO: Add JSON schema validation
        // TODO: Parse this into a structured class
        let voxelScene = JSON.parse(docContent);

        this._webView.webview.html = this._createHtml(voxelScene);
    }

    private _createHtml(voxelScene : VoxelScene) : string
    {
        this._webView.title = voxelScene.scene;
        console.log('Creating html for ' + voxelScene.scene);

        let html : string = this._getCanvas();

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Voxel Editor</title>
        </head>
        <body>
            <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
            ${html}
            <script src="index.js"></script>
        </body>
        </html>`;
    }

    private _getCanvas() : string
    {
        // TODO: Do we want to add some control here?
        return `<canvas id='canvas' width='100%'></canvas>`;
    }

    dispose() {
        this._webView.dispose();
    }
}



// Interfaces

interface Position {
    x : number;
    y : number;
    z : number;
}

interface Voxel {
    rgb : string;
    a : number;
    pos : Position;
}

interface Component {
    name : string;
    voxels : Voxel[];
}

interface VoxelScene {
    scene : string;
    size : object;
    components : Component[];
}