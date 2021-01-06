const modules = require("./modules.js");
const assert = require('assert');
const Enviroment = require("./enviroment.js");

/**
 * Owlet interpreter.
 */

class Owlet {
    //https://www.regular-expressions.info/examplesprogrammer.html
    // static re = {
    //     "int": /\b0[zZ][01N]+\b|[-+]?\b\d+\b/g,
    //     "string": /"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/g
    // }

    constructor(global = Enviroment.builtins) {
        this.global = global;
    }


    /**
     * Evaluates an expression within the given environment.
     * @param {*} exp 
     * @param {*} env 
     */
    eval(exp, env = this.global) {
        //"17" => ["17"][0]
        if (isInt(exp) || isFloat(exp) || isString(exp)) {
            return exp;
        }

        if (exp[0] === '+') {
            return this.eval(exp[1]).add(this.eval(exp[2]));
        }

        if (exp[0] === '-') {
            return this.eval(exp[1]).sub(this.eval(exp[2]));
        }

        if (exp[0] === '*') {
            return this.eval(exp[1]).mul(this.eval(exp[2]));
        }

        if (exp[0] === '/') {
            return this.eval(exp[1]).div(this.eval(exp[2]));
        }

        if (exp[0] === 'var') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value));
        }

        if (isVariableName(exp)) {
            return env.lookup(exp);
        }


        throw `Unimplemented: ${JSON.stringify(exp)}`;
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

function isVariableName(exp) {
    return typeof exp === 'string' && /^[a-zA-Z]+$/.test(exp);
}


module.exports =  Owlet;