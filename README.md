# owlet
An experimental balanced ternary language with C-style syntax. This crate includes the interpreter able to decode and run Owlet programs. This is not a full emulator, but it's intended to be used as a library for other applications to use in ternary software development. And it has those dependencies:
* [BigInteger.js](https://github.com/peterolson/BigInteger.js/) to print numbers
* [myna-parser](http://github.com/cdiggins/myna-parser/) for the interpreter

# Running owlet
As this language is work in progress, there is currently no way to run it. See the API.md for a rundown of the syntax.

# Status
The language work in progress, the not fully designed and there are some tests.

# How it Works
The basic logic for the Owlet interpreter is:

1. Define a grammar and parser using the Myna library
2. Execute the generated parser on the input to generate an untyped abstract syntax tree (AST)
3. Rewrite the AST into an intermediate Lisp-style S-expression
4. Parse the S-expression using the recursive `eval` function

# License
Owlet is licensed under the MIT License.
