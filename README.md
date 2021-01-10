# owlet v0.0
An experimental balanced ternary language with C-style syntax. This crate includes the interpreter able to decode and run Owlet programs. This is not a full emulator, but it's intended to be used as a library for other applications to use in ternary software development. And it has those dependencies:
* [BigInteger.js](https://github.com/peterolson/BigInteger.js/) to print numbers
* [myna-parser](http://github.com/cdiggins/myna-parser/) for the interpreter

# Running owlet
As this language is work in progress, there is currently no way to run the intended C-style syntax. However, the infrastructure provides a way to run an intermediate S-expression-ish array in node.js using `Owlet.eval()`. Here's anexample of the intermediate expression:
```js
['begin',
    ['def', 'factorial', ['x'], [
        'if',
        ['=', 'x', I(1)],
        I(1),
        ['*', 'x', ['factorial', ['-', 'x', I(2)]]]
    ]
    ],
    ['print', ['factorial', I(19)]]
]
```

Which requires you define this at the start of code:
```js
var I = (e) => { return new modules.int._Int(e) };
var F = (e) => { return new modules.float._Float(e) };
var S = (e) => { return new modules.string._String(e) };
var T = modules.table._Table.from;
```

# Status
The language is work in progress, so it's not fully designed and there are some tests.

# How it Works
The basic logic for the Owlet interpreter is:

1. Load `modules.js`, which is a nested module containing these modules:
    * `trit`, which defines a three-valued logic.
    * `int`, which defines arbitrary-precision integers stored in balanced ternary.
    * `table`, which defines a hash table (object).
    * `string`, which defines a string which is an array of ASCII characters.
    * `nullType`, which defines empty null type.
    * `quit`, which handles errors.
    * `float`, which defines arbitrary-precision floating-point numbers stored in LNS.
2. Define a grammar and parser using the Myna library
3. Execute the generated parser on the input to generate an untyped abstract syntax tree (AST)
4. Rewrite the AST into an intermediate Lisp-style S-expression, that makes use of the types in `module.js`
5. Parse the S-expression using the recursive `eval` function

# License
Owlet is licensed under the MIT License.
