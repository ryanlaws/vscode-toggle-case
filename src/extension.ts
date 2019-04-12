import * as vscode from 'vscode';
import { toggleCaseCommands, runCommand, copyToggled, COMMAND_LABELS } from './toggle-case-commands';

export function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('extension.toggleCase.commands', toggleCaseCommands);
    vscode.commands.registerCommand('extension.toggleCase.camel', () => { runCommand(COMMAND_LABELS.camel) });
    vscode.commands.registerCommand('extension.toggleCase.constant', () => { runCommand(COMMAND_LABELS.constant) });
    vscode.commands.registerCommand('extension.toggleCase.dot', () => { runCommand(COMMAND_LABELS.dot) });
    vscode.commands.registerCommand('extension.toggleCase.kebab', () => { runCommand(COMMAND_LABELS.kebab) });
    vscode.commands.registerCommand('extension.toggleCase.lower', () => { runCommand(COMMAND_LABELS.lower) });
    vscode.commands.registerCommand('extension.toggleCase.lowerFirst', () => { runCommand(COMMAND_LABELS.lowerFirst) });
    vscode.commands.registerCommand('extension.toggleCase.no', () => { runCommand(COMMAND_LABELS.no) });
    vscode.commands.registerCommand('extension.toggleCase.param', () => { runCommand(COMMAND_LABELS.param) });
    vscode.commands.registerCommand('extension.toggleCase.pascal', () => { runCommand(COMMAND_LABELS.pascal) });
    vscode.commands.registerCommand('extension.toggleCase.path', () => { runCommand(COMMAND_LABELS.path) });
    vscode.commands.registerCommand('extension.toggleCase.sentence', () => { runCommand(COMMAND_LABELS.sentence) });
    vscode.commands.registerCommand('extension.toggleCase.snake', () => { runCommand(COMMAND_LABELS.snake) });
    vscode.commands.registerCommand('extension.toggleCase.swap', () => { runCommand(COMMAND_LABELS.swap) });
    vscode.commands.registerCommand('extension.toggleCase.title', () => { runCommand(COMMAND_LABELS.title) });
    vscode.commands.registerCommand('extension.toggleCase.upper', () => { runCommand(COMMAND_LABELS.upper) });
    vscode.commands.registerCommand('extension.toggleCase.upperFirst', () => { runCommand(COMMAND_LABELS.upperFirst) });
    // New from fork
    vscode.commands.registerCommand('extension.toggleCase.toggleCase', () => { runCommand(COMMAND_LABELS.toggleCase) });
    vscode.commands.registerCommand('extension.toggleCase.copyToggled', () => { copyToggled() });
}
