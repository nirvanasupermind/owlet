const modules = require("./modules.js");
const Owlet = require("./owlet.js");
const Enviroment = require("./enviroment.js")
var owlet2 = new Owlet();

owlet2.eval(["var","x","true"])
var input = 'x';
console.log(owlet2.eval(input));