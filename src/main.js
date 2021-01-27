const modules = require("./modules.js");
const BigInteger = require("big-integer")
// var x1 = modules.num._Num.parse("1276.5");
// var y1 = new modules.rat._Rat(50);
// console.log(x1+"")
const Owlet = require('./owlet.js')
const owletParser = require('./parser/owletParser.js')
var owlet = new Owlet();
owlet.evalFile("test.owlet");