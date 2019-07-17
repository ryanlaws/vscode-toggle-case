import * as vscode from 'vscode';
import { EOL } from 'os';
import * as changeCase from 'change-case';
const lodashUniq = require('lodash.uniq');

type ToggleConfiguration = {
    case1: string,
    case2: string
}

type StringProcessor = (input: string) => string

export const COMMAND_LABELS = {
    camel: 'camel',
    constant: 'constant',
    dot: 'dot',
    kebab: 'kebab',
    lower: 'lower',
    lowerFirst: 'lowerFirst',
    no: 'no',
    param: 'param',
    pascal: 'pascal',
    path: 'path',
    sentence: 'sentence',
    snake: 'snake',
    swap: 'swap',
    title: 'title',
    upper: 'upper',
    upperFirst: 'upperFirst',
    toggleCase: 'toggleCase',
    copyToggled: 'copyToggled'
};

const notifyOrThrow = (message: string, doThrow = false): void => {
    if (doThrow) {
        throw new Error(message);
    } else {
        vscode.window.setStatusBarMessage(`ToggleCase : ${message}`, 5000);
    }
}

const toggleCase = (input: string, throwWhenInvalid = false): string | undefined => {
    const { case1, case2 } = <ToggleConfiguration>(vscode.workspace.getConfiguration('toggleCase') || { case1: '', case2: '' })
    const notify = (message) => notifyOrThrow(message, throwWhenInvalid)

    let method;

    if (!isValidCase(case1) || !isValidCase(case2)) {
        notify("One or both of the cases are invalid or not configured.")
        return input;
    }

    if (input === changeCase[case1](input)) {
        method = case2
    } else if (input === changeCase[case2](input)) {
        method = case1
    } else {
        notify("Selection(s) don't match either configured case.");
    }

    const output = changeCase[method](input);
    if (input === output) {
        notify("Toggling case had no effect.");
    }
    return output;
}

export async function copyToggled(): Promise<void> {
    let input;
    try {
        input = getSelectedTextIfOnlyOneSelection();
        if (input === undefined) {
            throw new Error(`Not one selection`);
        }
    }
    catch (e) {
        notifyOrThrow(`Only one selection can be copied at a time`)
        return;
    }

    try {
        const output = toggleCase(input, true);
        await vscode.env.clipboard.writeText(output);
    } catch (e) {
        notifyOrThrow(`Error copying selection to clipboard : ${e.message}`)
    }
}

const TRANSFORM_COMMAND_DEFS = [
    { label: COMMAND_LABELS.camel, description: 'Convert to a string with the separators denoted by having the next letter capitalised', func: changeCase.camel },
    { label: COMMAND_LABELS.constant, description: 'Convert to an upper case, underscore separated string', func: changeCase.constant },
    { label: COMMAND_LABELS.dot, description: 'Convert to a lower case, period separated string', func: changeCase.dot },
    { label: COMMAND_LABELS.kebab, description: 'Convert to a lower case, dash separated string (alias for param case)', func: changeCase.param },
    { label: COMMAND_LABELS.lower, description: 'Convert to a string in lower case', func: changeCase.lower },
    { label: COMMAND_LABELS.lowerFirst, description: 'Convert to a string with the first character lower cased', func: changeCase.lcFirst },
    { label: COMMAND_LABELS.no, description: 'Convert the string without any casing (lower case, space separated)', func: changeCase.no },
    { label: COMMAND_LABELS.param, description: 'Convert to a lower case, dash separated string', func: changeCase.param },
    { label: COMMAND_LABELS.pascal, description: 'Convert to a string denoted in the same fashion as camelCase, but with the first letter also capitalised', func: changeCase.pascal },
    { label: COMMAND_LABELS.path, description: 'Convert to a lower case, slash separated string', func: changeCase.path },
    { label: COMMAND_LABELS.sentence, description: 'Convert to a lower case, space separated string', func: changeCase.sentence },
    { label: COMMAND_LABELS.snake, description: 'Convert to a lower case, underscore separated string', func: changeCase.snake },
    { label: COMMAND_LABELS.swap, description: 'Convert to a string with every character case reversed', func: changeCase.swap },
    { label: COMMAND_LABELS.title, description: 'Convert to a space separated string with the first character of every word upper cased', func: changeCase.title },
    { label: COMMAND_LABELS.upper, description: 'Convert to a string in upper case', func: changeCase.upper },
    { label: COMMAND_LABELS.upperFirst, description: 'Convert to a string with the first character upper cased', func: changeCase.ucFirst },
    // New commands from fork
    { label: COMMAND_LABELS.toggleCase, description: 'Toggle between configured cases', func: toggleCase },
];

// New commands from fork
const EFFECT_COMMAND_DEFS = [
    { label: COMMAND_LABELS.copyToggled, description: 'Copy toggled between configured cases', func: copyToggled }
];

export function toggleCaseCommands() {
    const firstSelectedText = getSelectedTextIfOnlyOneSelection();
    const opts: vscode.QuickPickOptions = { matchOnDescription: true, placeHolder: 'What do you want to do to the current word / selection(s)?' };

    // if there's only one selection, show a preview of what it will look like after conversion in the QuickPickOptions,
    // otherwise use the description used in TRANSFORM_COMMAND_DEFS
    const items: vscode.QuickPickItem[] = TRANSFORM_COMMAND_DEFS.map(c => ({
        label: c.label,
        description: firstSelectedText ? `Convert to ${(<StringProcessor>c.func)(firstSelectedText)}` : c.description
    }))
        .concat(EFFECT_COMMAND_DEFS);

    vscode.window.showQuickPick(items)
        .then(command => runCommand(command.label));
}

export function runCommand(commandLabel: string) {
    const commandDefinition = TRANSFORM_COMMAND_DEFS.filter(c => c.label === commandLabel)[0];
    if (!commandDefinition) return;

    const editor = vscode.window.activeTextEditor;
    const { document, selections } = editor;

    let replacementActions = [];

    editor.edit(editBuilder => {
        replacementActions = selections.map(selection => {
            const { text, range } = getSelectedText(selection, document);

            let replacement;
            let offset;

            if (selection.isSingleLine) {
                replacement = (<StringProcessor>commandDefinition.func)(text);

                // it's possible that the replacement string is shorter or longer than the original,
                // so calculate the offsets and new selection coordinates appropriately
                offset = replacement.length - text.length;
            } else {
                const lines = document.getText(range).split(EOL);

                const replacementLines = lines.map(x => (<StringProcessor>commandDefinition.func)(x));
                replacement = replacementLines.reduce((acc, v) => (!acc ? '' : acc + EOL) + v, undefined);
                offset = replacementLines[replacementLines.length - 1].length - lines[lines.length - 1].length;
            }

            return {
                text,
                range,
                replacement,
                offset,
                newRange: isRangeSimplyCursorPosition(range)
                    ? range
                    : new vscode.Range(range.start.line, range.start.character, range.end.line, range.end.character + offset)
            };
        });

        replacementActions
            .filter(x => x.replacement !== x.text)
            .forEach(x => {
                editBuilder.replace(x.range, x.replacement);
            });

    }).then(() => {
        const sortedActions = replacementActions.sort((a, b) => compareByEndPosition(a.newRange, b.newRange));

        // in order to maintain the selections based on possible new replacement lengths, calculate the new
        // range coordinates, taking into account possible edits earlier in the line
        const lineRunningOffsets = lodashUniq(sortedActions.map(s => s.range.end.line))
            .map(lineNumber => ({ lineNumber, runningOffset: 0 }));

        const adjustedSelectionCoordinateList = sortedActions.map(s => {
            const lineRunningOffset = lineRunningOffsets.filter(lro => lro.lineNumber === s.range.end.line)[0];
            const range = new vscode.Range(
                s.newRange.start.line, s.newRange.start.character + lineRunningOffset.runningOffset,
                s.newRange.end.line, s.newRange.end.character + lineRunningOffset.runningOffset
            );
            lineRunningOffset.runningOffset += s.offset;
            return range;
        });

        // now finally set the newly created selections
        editor.selections = adjustedSelectionCoordinateList.map(r => toSelection(r));
    });
}

function isValidCase(str: string): boolean {
    if (!str) return false;
    const validCases = [
        "camel",
        "constant",
        "dot",
        "kebab",
        "lower",
        "lowerFirst",
        "no",
        "param",
        "pascal",
        "path",
        "sentence",
        "snake",
        "title",
        "upper",
        "upperFirst"
    ];
    return validCases.indexOf(str) > -1;
}

function getSelectedTextIfOnlyOneSelection(): string {
    const editor = vscode.window.activeTextEditor;
    const { document, selection, selections } = editor;

    // check if there's only one selection or if the selection spans multiple lines
    if (selections.length > 1 || selection.start.line !== selection.end.line) return undefined;

    return getSelectedText(selections[0], document).text;
}

function getSelectedText(selection: vscode.Selection, document: vscode.TextDocument): { text: string, range: vscode.Range } {
    let range: vscode.Range;

    if (isRangeSimplyCursorPosition(selection)) {
        range = getToggleCaseWordRangeAtPosition(document, selection.end);
    } else {
        range = new vscode.Range(selection.start, selection.end);
    }

    return {
        text: range ? document.getText(range) : undefined,
        range
    };
}

const CHANGE_CASE_WORD_CHARACTER_REGEX = /([\w_\.\-\/$]+)/;
const CHANGE_CASE_WORD_CHARACTER_REGEX_WITHOUT_DOT = /([\w_\-\/$]+)/;

// Change Case has a special definition of a word: it can contain special characters like dots, dashes and slashes
function getToggleCaseWordRangeAtPosition(document: vscode.TextDocument, position: vscode.Position) {
    const configuration = vscode.workspace.getConfiguration('toggleCase')
    const includeDotInCurrentWord = configuration ? configuration.get('includeDotInCurrentWord', false) : false;
    const regex = includeDotInCurrentWord
        ? CHANGE_CASE_WORD_CHARACTER_REGEX
        : CHANGE_CASE_WORD_CHARACTER_REGEX_WITHOUT_DOT;

    const range = document.getWordRangeAtPosition(position);
    if (!range) return undefined;

    let startCharacterIndex = range.start.character - 1;
    while (startCharacterIndex >= 0) {
        const charRange = new vscode.Range(
            range.start.line, startCharacterIndex,
            range.start.line, startCharacterIndex + 1
        );
        const character = document.getText(charRange);
        if (character.search(regex) === -1) { // no match
            break;
        }
        startCharacterIndex--;
    }

    const lineMaxColumn = document.lineAt(range.end.line).range.end.character;
    let endCharacterIndex = range.end.character;
    while (endCharacterIndex < lineMaxColumn) {
        const charRange = new vscode.Range(
            range.end.line, endCharacterIndex,
            range.end.line, endCharacterIndex + 1
        );
        const character = document.getText(charRange);
        if (character.search(regex) === -1) { // no match
            break;
        }
        endCharacterIndex++;
    }

    return new vscode.Range(
        range.start.line, startCharacterIndex + 1,
        range.end.line, endCharacterIndex
    );
}

function isRangeSimplyCursorPosition(range: vscode.Range): boolean {
    return range.start.line === range.end.line && range.start.character === range.end.character;
}

function toSelection(range: vscode.Range): vscode.Selection {
    return new vscode.Selection(
        range.start.line, range.start.character,
        range.end.line, range.end.character
    );
}

function compareByEndPosition(a: vscode.Range | vscode.Selection, b: vscode.Range | vscode.Selection): number {
    if (a.end.line < b.end.line) return -1;
    if (a.end.line > b.end.line) return 1;
    if (a.end.character < b.end.character) return -1;
    if (a.end.character > b.end.character) return 1;
    return 0;
}
