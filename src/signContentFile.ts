import { exec } from 'child_process';
import * as vscode from 'vscode';

import * as commands from './commands';
import { OutputChannelLogging } from './logging';
import { collectSignContentFileInputs } from './sign-content_file-parameters';

export function activate(context: vscode.ExtensionContext) {
    commands.register(context, {
        'hoganslendertanium.signContentFile': (uri: vscode.Uri) => {
            SignContentFile.signContentFile(uri, context);
        },
    });
}

export class SignContentFile {
    static async initSigningKeys(context: vscode.ExtensionContext) {
        const p = new Promise<void>(async (resolve, reject) => {
            // get configurations
            const config = vscode.workspace.getConfiguration('hoganslender.tanium.sign.content');

            const state = await collectSignContentFileInputs(config, context);

            if (state.selectedItem === undefined) {
                // something was cancelled, exit
                return reject();
            }

            return resolve();
        });

        return p;
    }

    public static async signContentFile(target: vscode.Uri, context: vscode.ExtensionContext) {
        // define output channel
        OutputChannelLogging.initialize();

        // get configurations
        const config = vscode.workspace.getConfiguration('hoganslender.tanium.sign.content');

        const state = await collectSignContentFileInputs(config, context);

        if (state.selectedItem === undefined) {
            // something was cancelled, exit
            return;
        }

        // collect values
        const keyUtilityPath = state.selectedItem.keyUtilityPath.includes(' ') ? `"${state.selectedItem.keyUtilityPath}"` : state.selectedItem.keyUtilityPath;
        const privateKeyFilePath = state.selectedItem.privateKeyFilePath.includes(' ') ? `"${state.selectedItem.privateKeyFilePath}"` : state.selectedItem.privateKeyFilePath;
        const targetPath = target.fsPath.includes(' ') ? `"${target.fsPath}"` : target.fsPath;

        OutputChannelLogging.showClear();

        OutputChannelLogging.log(`Key utility path: ${keyUtilityPath}`);
        OutputChannelLogging.log(`private key file path: ${privateKeyFilePath}`);
        OutputChannelLogging.log(`file to sign: ${targetPath}`);

        this.signContent(keyUtilityPath, privateKeyFilePath, targetPath);
    }

    public static signContent(keyUtilityPath: string, privateKeyFilePath: string, targetPath: string) {
        const p = new Promise<void>((resolve, reject) => {
            const commandline = `${keyUtilityPath} signcontent ${privateKeyFilePath} ${targetPath}`;

            OutputChannelLogging.log(`executing - ${commandline}`);

            exec(commandline, (error, stdout, stderr) => {
                if (error) {
                    OutputChannelLogging.logError(`error executing command`, error);
                    return reject();
                }

                if (stderr) {
                    OutputChannelLogging.log(`error executing command - ${stderr}`);
                    return reject();
                }

                OutputChannelLogging.log(`commmand output: ${stdout}`);
                return resolve();
            });
        });

        return p;
    }
}