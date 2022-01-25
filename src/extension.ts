import { ExtensionContext } from 'vscode';

import { OutputChannelLogging } from './logging';
import * as signContentFile from './signContentFile';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	OutputChannelLogging.initialize();

	signContentFile.activate(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }
