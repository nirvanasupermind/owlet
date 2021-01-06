const modules = require("./modules.js");
const assert = require('assert');
const Environment = require("./environment.js");

var WHILE_LIMIT = 2000;
Object.prototype._toString = function () {
    return String(this);
}
/**
 * Owlet interpreter.
 */

class Owlet {
    //https://www.regular-expressions.info/examplesprogrammer.html
    // static re = {
    //     "int": /\b0[zZ][01N]+\b|[-+]?\b\d+\b/g,
    //     "string": /"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/g
    // }


    constructor(global = Environment.builtins) {
        this.global = global;
    }


    /**
     * Evaluates an intermediate S-expression within the given environment.
     * @param {*} exp 
     * @param {*} env 
     */
    eval(exp, env = this.global) {

        //literals
        if (isInt(exp) || isString(exp)) {
            return exp;
        }

        //math

        if (exp[0] === '+') {
            if (isString(exp[1]) || isString(exp[2])) {
                var t1 = this.eval(exp[1], env);
                var t2 = this.eval(exp[2], env)
                var str = modules.string._String;
                return new str(t1._toString()).concat(new str(t2._toString()));
            }
            return this.eval(exp[1], env).add(this.eval(exp[2], env));
        }

        if (exp[0] === '-') {
            return this.eval(exp[1], env).sub(this.eval(exp[2], env));
        }

        if (exp[0] === '*') {
            return this.eval(exp[1], env).mul(this.eval(exp[2], env));
        }

        if (exp[0] === '/') {
            return this.eval(exp[1], env).div(this.eval(exp[2], env));
        }

        //comparison

        if (exp[0] === '>') {
            return this.eval(exp[1], env).compareTo(this.eval(exp[2], env)) > 0;
        }

        if (exp[0] === '>=') {
            return this.eval(exp[1], env).compareTo(this.eval(exp[2], env)) >= 0;
        }

        if (exp[0] === '<') {
            return this.eval(exp[1], env).compareTo(this.eval(exp[2], env)) < 0;
        }

        if (exp[0] === '<=') {
            return this.eval(exp[1], env).compareTo(this.eval(exp[2], env)) <= 0;
        }

        if (exp[0] === '=') {
            return this.eval(exp[1], env).compareTo(this.eval(exp[2], env)) === 0;
        }


        //variable define

        if (exp[0] === 'local') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }

        if (exp[0] === 'global') {
            const [_, name, value] = exp;
            return this.global.define(name, this.eval(value, this.global));
        }


        if (exp[0] === 'set') {
            const [_, name, value] = exp;
            return env.assign(name, this.eval(value, env));
        }


        //variable lookup
        if (isVariableName(exp)) {
            return env.lookup(exp);
        }

        //block
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        //if
        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;
            if (!falsey(this.eval(condition, env))) {
                return this.eval(consequent, env);
            }
            return this.eval(alternate, env);
        }


        //while
        if (exp[0] === 'while') {
            const [_tag, condition, body] = exp;
            var count = new modules.int._Int("0");
            let result;
            while(!falsey(this.eval(condition,env))) {
               result = this.eval(body,env) 
            }
            return result;
        }

        modules.quit.quit(`Unimplemented: ${JSON.stringify(exp)}`);
    }

    _evalBlock(block, env) {
        let result;
        const [_tag, ...expressions] = block;
        expressions.forEach(exp => {
            result = this.eval(exp, env);
        });

        return result;
    }




}




function isInt(exp) {
    return exp instanceof modules.int._Int;
}

// function isFloat(exp) {
//     return exp instanceof modules.float._Float;
// }

function isString(exp) {
    return exp instanceof modules.string._String;
}

function isVariableName(exp) {
    return typeof exp === 'string' && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(exp);
}

function falsey(exp) {
    return [
        new modules.int._Int("0"),
        new modules.trit._Trit("0"),
        new modules.trit._Trit("N"),
        new modules.string._String(new modules.table._Table()),
        // new modules.float._Float(modules.int._Int.ZERO, modules.int._Int.ZERO),
        new modules.nullType._Null()
    ].map(JSON.stringify).indexOf(JSON.stringify(exp)) >= 0 || !exp;
}


module.exports = Owlet;