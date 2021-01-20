const modules = require("./modules.js");
const BigInteger = require("big-integer")
// var x1 = new modules.rat._Rat(180);
// var y1 = new modules.rat._Rat(50);
// console.log(x1.compareTo(y1));

const Owlet = require('./owlet.js')
const owletParser = require('./parser/owletParser.js')
var owlet = new Owlet();
owlet.evalFile("test.owlet");