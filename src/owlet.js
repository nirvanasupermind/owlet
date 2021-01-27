const modules = require("./modules.js");
const assert = require('assert');
const Environment = require("./environment.js");
const util = require('util');
const BigInteger = require('big-integer')
const owletParser = require('./parser/owletParser.js')
const Transformer = require('./transformer.js')
const fs = require('fs');
const path = require('path');

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


var stack = 0;
var toInt2 = () => GlobalEnvironment.lookup("int");
Function.prototype._toString = function () {
    if (this.name === "") {
        return "<built-in function>";
    }
    return "<built-in function " + this.name + ">";
}

Function.prototype.toJSON = Function.prototype._toString

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



function toInt(x, b = new modules.int._Int(10)) {
    var flipflag = Math.sign(parseFloat(x))
    var a = x.replace(/[/-]/g, '')
    return new modules.int._Int(modules.int._Int.bigToBT(BigInteger(a, b.bigIntValue()))).mul(flipflag);
}

function type(x) {
    if (!(x instanceof Array)) {
        x = [x]
    }
    return x.map((e) => (e.constructor.name.charAt(0) === "_") ? e.constructor.name.substring(1).toLowerCase() : e.constructor.name.toLowerCase()) + "";
}
function tableToTuple(table) {
    var hashes = {};
    for (var i = 0; i < Object.getOwnPropertyNames(table.hashes).length; i++) {
        var prop = Object.getOwnPropertyNames(table.hashes)[i];
        hashes[JSON.parse(prop)] = table.hashes[prop];
    }
    return new modules.tuple._Tuple(...Object.assign([], hashes));
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


    constructor(global = GlobalEnvironment) {
        this.global = global;
        this._transformer = new Transformer();
    }

    _preProcess(exp) {
        exp = removeComments(exp);
        exp = exp.replace(/(\b0[zZ][01N]+\b)/g, function (_, grp) {
            return new modules.int._Int(grp.slice(2)).toString();
        });
        
        exp = exp.replace(/(\b[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)\b)/g,function(_,grp) {
           return modules.num._Num.parse(grp).toString();
        });

        return exp;
    }


    /**
     * Evaluates an intermediate S-expression within the given environment.
     * @param {*} exp 
     * @param {*} env 
     */
    eval(exp, env = this.global, parse) {
        if (!parse) {
            exp = this._preProcess(exp);
            exp = owletParser.parse(exp);
        }





        if (typeof exp === "string" && exp.charAt(0) === "{" && exp.slice(-1) === "}") {
            var result = new modules.table._Table();
            if (exp === "{}") { } else if (exp.includes(":")) {
                var els = exp.slice(1, -1).split(",").map((e) => e.split(":"));
                for (var i = 0; i < els.length; i++) {
                    result.set(this.eval(els[i][0], env), this.eval(els[i][1], env));
                }
            } else {
                var els = exp.slice(1, -1).split(",");
                for (var i = 0; i < els.length; i++) {
                    result.set(new modules.int._Int(i), this.eval(els[i], env));
                }
            }

            return result;
        }

        if (typeof exp === "string" && exp.charAt(0) === "<" && exp.slice(-1) === ">") {
            var exp2 = "{" + exp.slice(1, -1) + "}";
            return tableToTuple(this.eval(exp2, env));

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
            return this.global.define(name, this.eval(value, env, true));
        }


        if (exp[0] === 'set') {
            const [_, ref, value] = exp;
            //Assignment to a property:
            if (ref[0] === 'prop') {
                const [_tag, instance, propName] = ref;
                const instanceEnv = this.eval(instance, env);
                if (instanceEnv instanceof modules.table._Table) {
                    return instanceEnv.set(this.eval(propName, env, true), this.eval(value, env, true))
                } else {
                    return instanceEnv.define(this.eval(propName, env, true), this.eval(value, env, true))
                }
            }
            return env.assign(ref, this.eval(value, env, true));
        }




        //=============
        //Block statements
        if (exp[0] === 'begin') {
            const blockEnv = new Environment({}, env);
            return this._evalBlock(exp, blockEnv);
        }

        stack++;

        if (typeof exp === "string" && exp.match(/^[+-]?[0-9]+\/[0-9]+$/g)) {
            var [n, d] = exp.split("/");
            return new modules.rat._Rat(this.eval(n, env), this.eval(d, env));
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



        if (exp[0] === 'prop') {
            const [_tag, instance, name] = exp;
            const instanceEnv = this.eval(instance, env, true);
            if (instanceEnv instanceof modules.table._Table || instanceEnv instanceof modules.tuple._Tuple) {
                return instanceEnv.get(name);
            }

            return instanceEnv.lookup(name);
        }

        if (exp[0] === 'class') {
            const [_tag, name, parent, body] = exp;
            var parentEnv = this.eval(parent, env, true);
            if (parentEnv.toString() === "null") {
                parentEnv = env;
            }

            const classEnv = new Environment({}, parentEnv);

            this._evalBody(body, classEnv);


            //Class is accesible by name
            return env.define(name, classEnv);

        }

        if (exp[0] === 'super') {
            const [_tag, className] = exp;
            return this.eval(className, env).parent;
        }

        if (exp[0] === 'new') {
            const classEnv = this.eval(exp[1], env);

            const instanceEnv = new Environment({}, classEnv);

            const args = exp
                .slice(2)
                .map((arg) => this.eval(arg, env, true))

            this._callUserDefinedFunction(
                classEnv.lookup('constructor'),
                [instanceEnv, ...args]
            )

            return instanceEnv;
        }



        if (exp[0] === 'switch') {
            //JIT-transpile to a if declaration
            const ifExp = this._transformer.transformSwitchToIf(exp);
            return this.eval(ifExp, env, true);
        }

        if (exp[0] === 'module') {
            const [_tag, name, body] = exp;
            const moduleEnv = new Environment({}, env);
            this._evalBody(body, moduleEnv);
            return env.define(name, moduleEnv);
        }

        if (exp[0] === 'import') {
            const [_tag, url] = exp;
            var moduleSrc = fs.readFileSync(path.join(__dirname, url._toString()), 'utf8')
            const body = owletParser.parse(this._preProcess(moduleSrc))
            const moduleExp = ["module", makeid(10), body];
            return this.eval(moduleExp, this.global, true);
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


        if (exp[0] === 'def') {
            const [_tag, name, params, body] = exp;


            //JIT-transpile to a variable declaration
            const varExp = this._transformer.transformDefToVarLambda(exp);
            return this.eval(varExp, env, true);
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
            return this._callUserDefinedFunction(fn, args);
        }


        modules.quit.quit(`Unimplemented: ${JSON.stringify(exp)}`);
    }

    _callUserDefinedFunction(fn, args) {
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

    evalFile(url, env = this.global) {

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
    return exp instanceof modules.num._Num;
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
        return new modules.num._Num(parseFloat(a));
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
    return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_&\|\^\%!]*$/.test(exp);
}

function falsey(exp) {
    return [
        new modules.int._Int("0"),
        new modules.int._Int("N"),
        new modules.num._Num(0),
        new modules.num._Num(1).neg(),
        new modules.rat._Rat("0", "1"),
        new modules.rat._Rat("N", "1"),
        new modules.trit._Trit("0"),
        new modules.trit._Trit("N"),
        new modules.nullType._Null()
    ].map(JSON.stringify).indexOf(JSON.stringify(exp)) >= 0 || !exp;
}

function removeComments(string) {
    //Takes a string of code, not an actual function.
    return string.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();//Strip comments
}


var GlobalEnvironment = {
    null: new modules.nullType._Null(),
    true: new modules.trit._Trit("1"),
    unknown: new modules.trit._Trit("0"),
    false: new modules.trit._Trit("N"),
    Math: new modules.table._Table(),
    '+'(op1, op2) {
        if (op1 instanceof modules.string._String && op2 instanceof modules.string._String) {
            return op1.concat(op2);
        }
        return op1.add(op2);
    },
    '-'(op1, op2 = null) {
        if (op2 == null)
            return op1.neg();
        return op1.sub(op2);
    },
    '*'(op1, op2) {
        return op1.mul(op2);
    },
    '/'(op1, op2) {
        return op1.div(op2);
    },
    '%'(op1, op2) {
        return op1.mod(op2);
    },
    '>'(op1, op2) {
        return new modules.trit._Trit(op1.compareTo(op2) > 0);
    },
    '>='(op1, op2) {
        return new modules.trit._Trit(op1.compareTo(op2) >= 0);
    },
    '<'(op1, op2) {
        return new modules.trit._Trit(op1.compareTo(op2) < 0);
    },
    '<='(op1, op2) {
        return new modules.trit._Trit(op1.compareTo(op2) <= 0);
    },
    '='(op1, op2) {
        return new modules.trit._Trit(JSON.stringify(op1) == JSON.stringify(op2));
    },
    '&'(op1, op2) {
        return new modules.int._Int(op1.and(op2));
    },
    "|"(op1, op2) {
        return new modules.int._Int(op1.or(op2))
    },
    "^"(op1, op2) {
        return new modules.int._Int(op1.xor(op2));
    },
    '!'(op1) {
        return op1.not();
    },
    '&&'(op1, op2) {
        return new modules.trit._Trit(op1.and(op2));
    },
    '||'(op1, op2) {
        return new modules.trit._Trit(op1.or(op2));
    },
    '^^'(op1, op2) {
        return new modules.trit._Trit(op1.xor(op2));
    },
    'print'(...args) {
        console.log(...args.map((e) => e._toString()));
        return new modules.nullType._Null();
    },
    'ord'(op1) {
        return new modules.int._Int(modules.int._Int.convertToBT(modules.int.ord(op1._toString())));
    },
    'len'(table) {
        if (table instanceof modules.tuple._Tuple) {
            return new modules.int._Int(table.toArray().length)
        }
        return new modules.int._Int(Object.getOwnPropertyNames(table.hashes).length);
    },
    'keys'(table) {
        return toTernary(Object.getOwnPropertyNames(table.hashes).map((e) => JSON.parse(e)));
    },
    'values'(table) {
        return toTernary(Object.getOwnPropertyNames(table.hashes).map((e) => table.get(JSON.parse(e))));
    },
    'trit'(...args) {
        if (JSON.stringify(args) === "[]") {
            return new modules.trit._Trit("N");
        } else if (args[0].toString() === "unknown") {
            return new modules.trit._Trit("0");
        } else {
            return (falsey(args[0]) ? new modules.trit._Trit("N") : new modules.trit._Trit("1"));
        }
    },
    'int'(...args) {
        switch (type(args)) {
            case "": return new modules.int._Int(0);
            case "int": return args[0];
            case "num": return args[0].a.div(modules.num.scale);
            case "rat": return args[0].n.div(args[0].d);
            case "trit": return new modules.int._Int(args[0].decimalValue())
            case "string": return toInt(args[0].toString())
            case "string,int": return toInt(args[0].toString(), args[1])
            default: modules.quit.quit(`invalid literal for int(): ${args._toString()}`)
        }
    },
    'num'(...args) {
        switch (type(args)) {
            case "": return new modules.num._Num(0);
            case "int": return new modules.num._Num(args[0].mul(modules.num.scale));
            case "num": return args[0];
            case "rat": return new modules.num._Num(args[0].n.mul(modules.num.scale).div(args[0].d))
            case "trit": return new modules.num._Num(args[0].decimalValue())
            case "string": return new modules.num._Num(parseFloat(args[0]))
            default: modules.quit.quit(`invalid literal for num(): ${args._toString()}`)
        }
    },
    'rat'(...args) {
        switch (type(args)) {
            case "": return new modules.rat._Rat(0, 1);
            case "int": return new modules.rat._Rat(args[0], modules.int._Int.ONE);
            case "num": return new modules.rat._Rat(args[0].a, modules.num.scale);
            case "rat": return args[0];
            case "trit": return new modules.rat._Rat(args[0].decimalValue(), 1);
            case "string": return (args[0].toString().includes("/") ? new modules.rat._Rat(toInt(args[0].toString().split("/")[0]), toInt(args[0].toString().split("/")[1])) : new modules.rat._Rat(toInt(args[0].toString()), 1))
            case "tuple": return new modules.rat._Rat(...args[0].toArray())
            case "int,int": return new modules.rat._Rat(args[0], args[1])
            default: modules.quit.quit(`invalid literal for rat(): ${args._toString()}`)
        }
    },
    'string'(...args) {
        return new modules.string._String(args[0]._toString());
    },
    'tuple'(...args) {
        switch (type(args)) {
            case "tuple": return args[0];
            case "table": return tableToTuple(args[0]);
            default: return new modules.tuple._Tuple(...args)
        }
    },
    'table'(...args) {
        switch (type(args)) {
            case "": return new modules.table._Table();
            case "tuple":
                var result = new modules.table._Table()
                for (var i = 0; i < args[0].toArray().length; i++) {
                    result.set(new modules.int._Int(i), args[0].toArray()[i]);
                }
                return result;
            case "table": return args[0];
            case "tuple,tuple":
                var result = new modules.table._Table()
                for (var i = 0; i < args[0].toArray().length; i++) {
                    result.set(args[0].toArray()[i], args[1].toArray()[i]);
                }
                return result;
            default:
                var result = new modules.table._Table()
                for (var i = 0; i < args.length; i++) {
                    result.set(new modules.int._Int(i), args[i]);
                }
                return result;

        }
    }
}

var GlobalEnvironmentClone = clone(GlobalEnvironment)

GlobalEnvironment.Math.set("PI", new modules.num._Num(Math.PI))
GlobalEnvironment.Math.set("E", new modules.num._Num(Math.E))
GlobalEnvironment.Math.set("abs", (n) => n.abs())
GlobalEnvironment.Math.set("sqrt", function sqrt(a) {
    if (type(a) !== "num") {
        return GlobalEnvironmentClone[type(a)](sqrt(GlobalEnvironmentClone.num(a)))
    }

    var xn = a.sub(1).div(2).add(1);
    //Newton method
    for (var i = 0; i < 100; i++) {
        var t1 = xn.mul(xn).sub(a);
        var t2 = xn.mul(2);
        xn = xn.sub(t1.div(t2));
    }

    return xn;

});

GlobalEnvironment.Math.set("cbrt", function cbrt(a) {
    if (type(a) !== "num") {
        return GlobalEnvironmentClone[type(a)](cbrt(GlobalEnvironmentClone.num(a)))
    }

    if (a.compareTo(0) < 0) {
        return cbrt(a.neg()).neg()
    }

    var xn = a.sub(1).div(3).add(1);
    //Newton method
    for (var i = 0; i < 100; i++) {
        var t1 = xn.mul(xn).mul(xn).sub(a);
        var t2 = xn.mul(xn).mul(3);
        xn = xn.sub(t1.div(t2));
    }

    return xn;

});

//Q&D integer power function
function pow(x, y) {
   var result = new modules.rat._Rat(1,1);
   for(var i = 0; i < y; i++) {
       result = x.mul(result);
   }

   return result;
}

function pow2(x, y) {
   var result = new modules.rat._Rat(1,1);
   for(var i = 0; i < y; i++) {
       result = x.mul(result);
   }

   return result;
}


GlobalEnvironment.Math.set("exp", function exp(a) {
    if (type(a) !== "rat") {
        return GlobalEnvironmentClone[type(a)](exp(GlobalEnvironmentClone.rat(a)));
    }

    if(a.compareTo(0) < 0) {
        return exp(a.neg()).rec();
    }

    //Power series
    var coefs = [["1", "1"], ["1", "1"], ["1", "1N"], ["1", "1N0"], ["1", "10N0"], ["1", "11110"], ["1", "1000N00"], ["1", "1N10N1N00"], ["1", "1N00110N100"], ["1", "1N00110N10000"], ["1", "1N1N11101N10000"], ["1", "10N10010000NN0000"], ["1", "11N0101100N11N00000"], ["1", "1NN101N00N1N0110N00000"], ["1", "10N100001NN1100001100000"], ["1", "1NNN0N00010001N001N1N000000"], ["1", "10N1N01N1NN1011NN1100NN000000"], ["1", "1NN1NN0N10110111N11N110111000000"], ["1", "1011010NN10N100NN0NN0N100N00000000"], ["1", "1N110N0N111N0NN0001N011NN010N00000000"], ["1", "1NN11N0N0N110010011NNN1N0N1000N100000000"], ["1", "111NN111NNN011N110N1N00111110N111000000000"], ["1", "1011N1101N0NNN0100NN01001N00NN0N0111000000000"], ["1", "100N1N1N11NN01000110N01N0NN000NNN01100N0000000N0"], ["1", "10NN1000011NNN0N010111NNN0N110NN0110NN0010000000N1N"], ["1", "1N11NN110101N10N0NN1N0NN10N011N01undefined111N1NN011000011001N"], ["1", "1N10N11N10N011N0NN0100101100NNNN10N10N1N110NNN01N0101N011"], ["1", "1N10N11N10N011N0NN0100101100NNNN10N10N1N110NNN01N0101N011N00"], ["1", "1N11NN1NN01110N1N100N1N1NN01N111NNN011N0N1N10N1011N111N1N10NN0N"], ["1", "10NN1NNN1NN0N0N0NN1111NN00111N00NN0011N00N00110100NNN010000101N1N0"]];
    var result = new modules.rat._Rat(0, 1);
    for (var i = 0; i < coefs.length; i++) {
        result = result.add(pow(a, i).mul(new modules.rat._Rat(...coefs[i])));
    }

    return result;

});



// GlobalEnvironment.Math.set("log", function log(a) {
//     if (type(a) !== "num") {
//         return GlobalEnvironmentClone[type(a)](log(GlobalEnvironmentClone.num(a)));
//     }

//     var result = new modules.num._Num(0)
//     for(var i = 1; i < 100; i++) {
//         var t1 = a.sub(1).div(a.add(1));
//         var t2 = pow(t1,2*i-1);
//         console.log("watapon");
//         result = result.add(t2.div(2*i-1));
//     }

//     result = result.mul(2);
//     return result;

// });
GlobalEnvironment = new Environment(GlobalEnvironment);
//Export
module.exports = Owlet;
