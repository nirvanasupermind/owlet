const modules = require("./modules.js");
const Owlet = require('./owlet.js')
// const parser = require('./parser.js')
const owletParser = require('./parser/owletParser.js')
var owlet = new Owlet();
owlet.evalFile("test.owlet")
// owlet.evalFile("./examples/hello-world.owlet")
// var I = (e) => { return new modules.int._Int(e) };
// var F = (e) => { return new modules.float._Float(e) };
// var S = (e) => { return new modules.string._String(e) };
// var T = modules.table._Table.from;

