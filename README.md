# owlet v0.0
An experimental balanced ternary language with C-style syntax. This crate includes the interpreter able to decode and run Owlet programs. This is not a full emulator, but it's intended to be used as a library for other applications to use in ternary software development. And it has those dependencies:
* [BigInteger.js](https://github.com/peterolson/BigInteger.js/) to print numbers
* [myna-parser](http://github.com/cdiggins/myna-parser/) for the interpreter

# Running owlet
As this language is work in progress, there is currently no way to run it. See [API.md](API.md) for a rundown of the syntax.

# Status
The language work in progress, the not fully designed and there are some tests.

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
