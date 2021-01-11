# owlet
Owlet is a high-level language for balanced ternary software development, using S-expressions and Polish notation in it's syntax. It was made using node.js. The infrastructure includes the interpreter able to run and decode Owlet programs. This is *not* a full [ternary computer](https://en.wikipedia.org/wiki/Ternary_computer), but is intended to be used as a library for other applications to use. And it has these dependencies:
* [BigInteger.js](https://github.com/peterolson/BigInteger.js/) to print numbers

# What is Owlet?
A **ternary computer** (also called trinary computer) is a computer that uses ternary logic (three possible values) instead of the more popular binary system ("Base 2") in its calculations. The dialect of ternary (balanced ternary) used in owlet has digits for {-1,0,1}. Yes, this means EVERY number is signed. owlet is a high-level implementation of a ternary computer,minus the central processing unit and RAM. This allows it to be used effectively as a library for other applications and ternary computers that require heavyweight computations.

# Running Owlet
Owlet files can be interpreted using node using the function `Owlet.prototype.evalFile()`, like so:
```js
const Owlet = require("owlet");
var owlet = new Owlet(); //Owlet interpreter
owlet.evalFile("my-file.owlet")
```

You can also evaluate the code in a JavaScript string itself, using the function `eval`:
```js
const Owlet = require("owlet");
var owlet = new Owlet(); //Owlet interpreter
owlet.eval(`(print "Hello World")`)
```

These examples require that you have Owlet installed on npm, which can be done on unix systems by typing `npm install owlet` into your terminal. An overview of the syntax can be found in [API.md](API.md).

# Status
The main part of this language is complete, although it may be expanded on later.

# License
Owlet is licensed under the MIT License.

