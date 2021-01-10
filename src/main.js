const modules = require("./modules.js");
const Owlet = require('./owlet.js')
var owlet = new Owlet();
var I = (e) => { return new modules.int._Int(e) };
var F = (e) => { return new modules.float._Float(e) };
var S = (e) => { return new modules.string._String(e) };
var T = modules.table._Table.from;

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



console.log(owlet.eval(expr));