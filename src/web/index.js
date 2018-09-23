(function() {
    // TODO: Make this a compiled Typescript file 
    const vscode = acquireVsCodeApi();

    // Handle the message inside the webview
    window.addEventListener('message', event => {
        const message = event.data; // The JSON data our extension sent

        switch (message.command) {
            case 'refactor':
                count = Math.ceil(count * 0.5);
                counter.textContent = count;
                break;
        }
    });
}())