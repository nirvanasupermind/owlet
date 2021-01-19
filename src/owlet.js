const modules = require("./modules.js");
const assert = require('assert');
const Environment = require("./environment.js");
const util = require('util');
const owletParser = require('./parser/owletParser.js')

Object.prototype._toString = function () {
    if (this instanceof modules.string._String) {
        return '"' + this.toString() + '"';
    }
    return this.toString();
}


Function.prototype._toString = function () {
    return "<built-in function '" + this.name + "'>"
}


var WHILE_LIMIT = 2000;


/**
 * Owlet interpreter.
 */

class Owlet {
    //https://www.regular-expressions.info/examplesprogrammer.html
    // static re = {
    //     "int": /\b0[zZ][01N]+\b|[-+]?\b\d+\b/g,
    //     "string": /"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/g
    // }


    constructor(global = GlobalEnviroment) {
        this.global = global;
    }


    /**
     * Evaluates an intermediate S-expression within the given environment.
     * @param {*} exp 
     * @param {*} env 
     */
    eval(exp, env = this.global, parse) {
        if (!parse) {
            exp = removeComments(exp);
            exp = owletParser.parse(exp);
        }

        //=============
        //Literals
        if (isInt(exp) || isString(exp) || isFloat(exp) || isTable(exp)) {
            return exp;
        }

        //Pass (do nothing)
        if (exp[0] === "pass") {
            return new modules.nullType._Null();
        }
        //=============
        //Variable define
        if (exp[0] === 'local') {
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env, true));
        }

        if (exp[0] === 'global') {
            const [_, name, value] = exp;
            return this.global.define(name, this.eval(value, this.global));
        }


        if (exp[0] === 'set') {
            const [_, name, value] = exp;
            return env.assign(name, this.eval(value, env, true));
        }




        //=============
        //Block statements
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        //==============
        //If statement
        if (exp[0] === 'if') {
            const [_tag, condition, consequent, alternate] = exp;
            if (!falsey(this.eval(condition, env, true))) {
                return this.eval(consequent, env, true);
            }
            return this.eval(alternate, env, true);
        }

        //==============
        //While statement
        if (exp[0] === 'while') {
            const [_tag, condition, body] = exp;
            var count = new modules.int._Int("0");
            let result;
            while (!falsey(this.eval(condition, env, true))) {
                result = this.eval(body, env, true)
            }
            return result;
        }


        if (isVariableName(exp)) {
            //=============
            //Variable lookup
            return env.lookup(exp);
        };


        //2. User-defined function:
        if (exp[0] === 'def') {
            const [_tag, name, params, body] = exp;
            const fn = {
                params,
                body,
                env, // Closure!

            }


            return env.define(name, fn);
        }

        //2. User-defined lambda:
        if (exp[0] === 'lambda') {
            const [_tag, params, body, call] = exp;
            return {
                params,
                body,
                env, // Closure!
            };
        }




        //==============
        //Function call
        if (Array.isArray(exp)) {
            var fn = this.eval(exp[0], env, true);
            var args = exp.slice(1).map((arg) => this.eval(arg, env, true));
            //1. Native function:
            if (typeof fn === 'function') {
                return fn(...args);
            }

            //2. User-defined function:
            const activationRecord = {};
            fn.params.forEach((param, index) => {
                activationRecord[param] = args[index];
            })

            const activationEnv = new Environment(
                activationRecord,
                fn.env //Static scope!
            );



            return this._evalBody(fn.body, activationEnv);

        }


        modules.quit.quit(`Unimplemented: ${JSON.stringify(exp)}`);
    }

    evalFile(url, env = this.global) {
        const fs = require('fs'),
            path = require('path')

        try {
            const data = fs.readFileSync(path.join(__dirname, url), 'utf8')
            return this.eval(data);
        } catch (err) {
            console.error(err)
        }


    }

    _evalBody(body, env) {
        if (body[0] === 'begin') {
            return this._evalBlock(body, env);
        }
        return this.eval(body, env, true);
    }

    _evalBlock(block, env) {
        let result;
        const [_tag, ...expressions] = block;
        expressions.forEach(exp => {
            result = this.eval(exp, env, true);
        });

        return result;
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

function isTable(exp) {
    return exp instanceof modules.table._Table;
}

function toTernary(a) {
    if (a.constructor.name === "Function" || a.params) {
        return a;
    }

    //=============
    //Literals
    var exp = a;
    if (isInt(exp) || isString(exp) || isFloat(exp) || isTable(exp)) {
        return exp;
    }

    if (typeof a === "number") {
        if (a % 1 === 0) {
            return new modules.int._Int(modules.int._Int.convertToBT(a));
        }
        return new modules.float._Float(parseFloat(a));
    } else if (typeof a === "boolean") {
        return new modules.trit._Trit(a);
    } else if (a.constructor.name === "Object" || a.constructor.name === "Array") {
        var b = {};
        for (var i = 0; i < Object.keys(a).length; i++) {
            b[toTernary(Object.keys(a)[i])] = toTernary(a[Object.keys(a)[i]]);
        }
        return modules.table._Table.from(b);
    } else if (typeof a === "string") {
        return new modules.string._String(a._toString());
    }
    return new modules.string._String(a._toString());
}

function isVariableName(exp) {
    return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_&\|\^!]*$/.test(exp);
}

function falsey(exp) {
    return [
        new modules.int._Int("0"),
        new modules.float._Float(0, 0),
        new modules.float._Float(-1),
        new modules.trit._Trit("0"),
        new modules.trit._Trit("N"),
        new modules.string._String(new modules.table._Table()),
        new modules.table._Table(),
        // new modules.float._Float(modules.int._Int.ZERO, modules.int._Int.ZERO),
        new modules.nullType._Null()
    ].map(JSON.stringify).indexOf(JSON.stringify(exp)) >= 0 || !exp;
}

function removeComments(string) {
    //Takes a string of code, not an actual function.
    return string.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();//Strip comments
}


var GlobalEnviroment = Environment.builtins;
//Export
module.exports = Owlet;
