const modules = require("./modules.js");
const Owlet = require('./owlet.js')
// const parser = require('./parser.js')
const p = require('./parser.js')
const myna_1 = require('myna-parser')
var owlet = new Owlet();

//==Start of my code==
// Get the parser 
try {
    let m = myna_1.Myna
    var parser = p.chickadeeParser;

    // Parse some input and print the AST
    var input = "var x = 13; x + 14;";

    console.log(parser(input));
} catch (ex) {
    console.log(ex, ex.stack.split("\n"));
}
//==End of my code==
//# sourceMappingURL=chickadee-grammar.js.map

var I = (e) => { return new modules.int._Int(e) };
var F = (e) => { return new modules.float._Float(e) };
var S = (e) => { return new modules.string._String(e) };
var T = modules.table._Table.from;


console.log(myna_1.Myna.parsers.chickadee(`var fib = (x) => {
   x <= 1 ? 1 : fib(x - 1) + fib(x - 2);
}
fib(7);`));

/*
var expr = ['begin',
    ['def', 'factorial', ['x'], [
        'if',
        ['=', 'x', I(1)],
        I(1),
        ['*', 'x', ['factorial', ['-', 'x', I(2)]]]
    ]
    ],
    ['print', ['factorial', I(19)]]
]



// console.log(owlet.eval(expr));
*/