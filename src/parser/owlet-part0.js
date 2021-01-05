import * as modules from "../modules.js"
const assert = require('assert');

/**
 * Owlet interpreter.
 */

class Owlet {
    //https://www.regular-expressions.info/examplesprogrammer.html
    static re = {
        "int": /\b0[zZ][01N]+\b|[-+]?\b\d+\b/g,
        "string": /"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/g
    }

    eval(exp) {
        //"17" => ["17"][0]
        if (isInt(exp) || isFloat(exp) || isString(exp)) {
            return exp;
        }

        if (exp[0] === '+') {
            return exp.slice(1).reduce((a, b) => this.eval(a).add(this.eval(b)));
        }






        throw "Unimplemented";
    }




}



function isInt(exp) {
    return exp instanceof modules.int._Int;
}



function isFloat(exp) {
    return exp instanceof modules.float._Float;
}

function isString(exp) {
    return exp instanceof modules.string._String;
}


export { Owlet }