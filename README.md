# owlet
[![npm version](https://badge.fury.io/js/owlet.svg)](https://badge.fury.io/js/owlet)<br />
Owlet is a high-level language for balanced ternary software development, using S-expression syntax. It was made using node.js. The infrastructure includes the interpreter able to run and decode Owlet programs. This is *not* a full [ternary computer](https://en.wikipedia.org/wiki/Ternary_computer), but is intended to be used as a library for other applications to use. And it has these dependencies:
* [BigInteger.js](https://github.com/peterolson/BigInteger.js/) to print numbers
* [syntax](https://github.com/DmitrySoshnikov/syntax) for the parser

Here is an example program:
```clojure
(begin
    (def fib(a) (begin
        (if (<= a 1)
            1
            (+ (fib (- a 1)) (fib (- a 2)))
        )
    ))
    (print fib)
)
```

For more examples see the `examples` folder. The current version of Owlet is v0.1.

# What is Owlet?
A **ternary computer** (also called trinary computer) is a computer that uses ternary logic (three possible values) instead of the more popular binary system ("Base 2") in its calculations. The dialect of ternary (balanced ternary) used in owlet has digits for {-1,0,1}. Yes, this means EVERY number is signed. owlet is a high-level implementation of a ternary computer,minus the CPU and RAM. This allows it to be used effectively as a library for other applications and ternary computers that require heavyweight computations.

# Implementation 
The v0.1 implementation of Owlet is written in JavaScript, and recursively evaluates the expression. It has multiple files to deal with each ternary data type such as ints and floats. The language implementation is quite small and simple compared to other weakly typed languages. Since the syntax is based on S-expression, the parser can be very small.

# API
An overview of the syntax can be found in [API.md](API.md). 

# Running Owlet
Owlet files can be run using node using the function `Owlet.prototype.evalFile()`, like so:
```js
const Owlet = require("owlet");
var owlet = new Owlet(); //Owlet interpreter
owlet.evalFile("my-file.owlet")
```

You can also evaluate the code in a JavaScript string, using the function `eval`:
```js
const Owlet = require("owlet");
var owlet = new Owlet(); //Owlet interpreter
owlet.eval("<put code here>")
```

These examples require that you have Owlet installed on npm, which can be done on Unix systems by typing `npm install owlet` into your terminal. 

# Status
The main part of this language is complete, although it may be expanded on later.

# License
Owlet is licensed under the MIT License.

