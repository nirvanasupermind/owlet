const modules = require("./modules.js");

var I = (e) => { return new modules.int._Int(modules.int._Int.convertToBT(e)) };
var S = (e) => { return new modules.string._String(e.toString()) };

// var num = new modules.rat._Rat(I(4),I(6));
// console.log(num);
console.log((I(65).mod(I(30)).bigIntValue()));
// const modules = require("./modules.js");
// const Owlet = require("./owlet.js");
// const Environment = require("./environment.js")
// var owlet2 = new Owlet();
// var I = (e) => { return new modules.int._Int(modules.int._Int.convertToBT(e)) };
// var S = (e) => { return new modules.string._String(e.toString()) };

// var input = ['begin',
//     ['local', 'counter', I(0)],
//     ['local', 'result', I(0)],
//     ['while',
//         ['<', 'counter', I(10)],
//         ['begin',
//         ['set', 'result', ['+', 'result', I(1)]],
//         ['set','counter',['+','counter',I(1)]]
//         ]
//     ],
//     'result'
// ];
// console.log(owlet2.eval(input).toString());