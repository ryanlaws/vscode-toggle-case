# Toggle Case Extension for Visual Studio Code

Fork of wmaurer's [change-case](https://marketplace.visualstudio.com/itemdetails?itemName=wmaurer.change-case).

A wrapper around [node-change-case](https://github.com/blakeembrey/node-change-case) for Visual Studio Code
with some extra goodies. Quickly change the case of the current selection or current word, toggle between
two configured case settings, or copy the toggled case to the clipboard. 
Handy for working with e.g. AngularJS directives.

If only one word is selected, the `extension.toggleCase.commands` command gives you a preview of each option:

![change-case-preview](https://cloud.githubusercontent.com/assets/2899448/10712456/3c5e29b6-7a9c-11e5-9ce4-7eb944889696.gif)

`toggle-case` also works with multiple cursors:

![toggle-case-multi](https://cloud.githubusercontent.com/assets/2899448/10712454/1a9019e8-7a9c-11e5-8f06-91fd2d7e21bf.gif)

*Note:* Please read the [documentation](https://code.visualstudio.com/Docs/editor/editingevolved) on how to use multiple cursors in Visual Studio Code.

## Install

Launch VS Code Quick Open (Ctrl/Cmd+P), paste the following command, and press enter.
```
ext install toggle-case
```

## Commands

* `extension.toggleCase.commands`: List all Change Case commands, with preview if only one word is selected
* `extension.toggleCase.camel`: Change Case 'camel': Convert to a string with the separators denoted by having the next letter capitalised
* `extension.toggleCase.constant`: Change Case 'constant': Convert to an upper case, underscore separated string
* `extension.toggleCase.dot`: Change Case 'dot': Convert to a lower case, period separated string
* `extension.toggleCase.kebab`: Change Case 'kebab': Convert to a lower case, dash separated string (alias for param case)
* `extension.toggleCase.lower`: Change Case 'lower': Convert to a string in lower case
* `extension.toggleCase.lowerFirst`: Change Case 'lowerFirst': Convert to a string with the first character lower cased
* `extension.toggleCase.no`: Convert the string without any casing (lower case, space separated)
* `extension.toggleCase.param`: Change Case 'param': Convert to a lower case, dash separated string
* `extension.toggleCase.pascal`: Change Case 'pascal': Convert to a string denoted in the same fashion as camelCase, but with the first letter also capitalised
* `extension.toggleCase.path`: Change Case 'path': Convert to a lower case, slash separated string
* `extension.toggleCase.sentence`: Change Case 'sentence': Convert to a lower case, space separated string
* `extension.toggleCase.snake`: Change Case 'snake': Convert to a lower case, underscore separated string
* `extension.toggleCase.swap`: Change Case 'swap': Convert to a string with every character case reversed
* `extension.toggleCase.title`: Change Case 'title': Convert to a space separated string with the first character of every word upper cased
* `extension.toggleCase.upper`: Change Case 'upper': Convert to a string in upper case
* `extension.toggleCase.upperFirst`: Change Case 'upperFirst': Convert to a string with the first character upper cased

New from fork
* `extension.toggleCase.toggleCase`: Toggle Case: Toggle between configured cases
* `extension.toggleCase.copyToggled`: Copy Toggled: Copy toggled between configured cases

## Support

[Create an issue](https://github.com/ryanlaws/vscode-toggle-case/issues), or ping [@waynemaurer](https://twitter.com/waynemaurer) on Twitter.
