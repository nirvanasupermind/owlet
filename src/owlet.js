const modules = require("./modules.js");
const assert = require('assert');
const Environment = require("./environment.js");
const util = require('util');
const BigInteger = require('big-integer')
const owletParser = require('./parser/owletParser.js')
const Transformer = require('./transformer.js')

var stack = 0;
Function.prototype._toString = function () {
    return "[Function: " + this.name + "]"
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


    /**
     * Evaluates an intermediate S-expression within the given environment.
     * @param {*} exp 
     * @param {*} env 
     */
    eval(exp, env = this.global, parse) {
        if (!parse) {
            exp = removeComments(exp);
            exp = exp.replace(/(\b0[zZ][01N]+\b)/g, function (_, grp) {
                return new modules.int._Int(grp.slice(2)).toString();
            });

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
            if(ref[0] === 'prop') {
                const [_tag, instance, propName] = ref;
                const instanceEnv = this.eval(instance,env);
                if(instanceEnv instanceof modules.table._Table) {
                    return instanceEnv.get(propName, this.eval(value,env,true))
                } else {
                    return instanceEnv.define(propName, this.eval(value,env,true))
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

        if (typeof exp === "string" && exp.match(/^[1-9][0-9]*\/[1-9][0-9]*$/g)) {
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
            const instanceEnv = this.eval(instance, env);
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
    PI: new modules.num._Num(Math.PI),
    E: new modules.num._Num(Math.E),
    PHI: new modules.num._Num((1 + Math.sqrt(5)) / 2),
    '+'(op1, op2) {
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
        return Object.getOwnPropertyNames(table.hashes).length;
    },
    'keys'(table) {
        return toTernary(Object.getOwnPropertyNames(table.hashes).map((e) => JSON.parse(e)));
    },
    'values'(table) {
        return toTernary(Object.getOwnPropertyNames(table.hashes).map((e) => table.get(JSON.parse(e))));
    },
    'abs'(op1) {
        return op1.abs()
    },
    'rat'(op1, op2) {
        return new modules.rat._Rat(op1, op2);
    },
    'rec'(op1) {
        if (op1 instanceof modules.rat._Rat) {
            return op1.rec();
        }

        return new modules.rat._Rat(1, op1);
    },
    '++'(op1) {
        return op1.add(1);
    },
    '--'(op1) {
        return op1.sub(1);
    }

}

GlobalEnvironment = new Environment(GlobalEnvironment);
//Export
module.exports = Owlet;
