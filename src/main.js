const modules = require("./modules.js");
const BigInteger = require("big-integer")
// var x2 = new modules.float._Float(4);
// console.log(x2+'')

const Owlet = require('./owlet.js')
const owletParser = require('./parser/owletParser.js')
var owlet = new Owlet();
// owlet.eval(`(begin
//     (local a 0)
//     (local t <"apple","bananana">)
//     (print (+ 9.0 2.8))
// )`);
owlet.evalFile("test.owlet")
