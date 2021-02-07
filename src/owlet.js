const modules = require("./modules.js");
const assert = require('assert');
const Environment = require("./environment.js");
const util = require('util');
const BigInteger = require('big-integer')
const Big = require('big-js')
const owletParser = require('./parser/owletParser.js')
const Transformer = require('./transformer.js')
const fs = require('fs');
const path = require('path');
const NEWTON_ITERATIONS = 60;


function printObj(o, name, show = Object.getOwnPropertyNames(o)) {
    if (show[0] === "*") {
        show = Object.getOwnPropertyNames(o).filter((e) => !(show.slice(1).includes(e)));
    }

    var result = "[" + name + "]"
    var o2 = {};
    for (var i = 0; i < show.length; i++) {
        o2[show[i]] = o[show[i]];
    }

    if (Object.getOwnPropertyNames(o2).length > 0) {
        result = "{ " + result + " " + JSON.stringify2(o2).slice(1, -1) + " }"
    }

    return result;
}

Object.prototype._toString = function () {
    if (String(this) === "[object Object]") {
        if (this.hasOwnProperty("record") && this.record.hasOwnProperty("__class__")) {
            return printObj(this.record, "Class", ["*", "__class__"])
        } else if (this.hasOwnProperty("parent") && String(this.parent) === "[object Object]" && this.parent.hasOwnProperty("record") && this.parent.record.hasOwnProperty("__class__")) {
            if (this.parent.record.hasOwnProperty("toString")) {
                return new Owlet()._callUserDefinedFunction(this.parent.lookup("toString"), [this])._toString();
            }
            return printObj(this.record, "Instance")
        } else if (this.hasOwnProperty("record")) {
            return printObj(this.record, "Module")
        } else if (this.hasOwnProperty("params") && this.hasOwnProperty("body")) {
            return printObj(this, "Function", []);
        }
    }


    if (this.toString().includes("Object]")) {
        return JSON.stringify2(this);
    }

    return this.toString();
}


// var stack = 0;
Function.prototype._toString = function () {
    if (this.name === "") {
        return "[Function]"
    }
    return "[Function: " + this.name + "]";
}

Function.prototype.toJSON = Function.prototype._toString;

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

        // exp = exp.replace(/\<(.*?)\>/g, function (_,grp) {
        //     return 
        // });

        exp = exp.replace(/(\{(.*?)\})/g, function (_, grp) {
            return owletParser.parse(grp);
        });

        // exp = exp.replace(/([1-9][0-9]*)\/([1-9][0-9]*)/g,function(_,n,d) {
        //     return new modules.rat._Rat(owletParser.parse(n),owletParser.parse(d));
        // })


        exp = exp.replace(/(\b[0-9]+(\.[0-9]+)?(e[+-]?[0-9]+)\b)/g, function (_, grp) {
            // console.log("2", arguments);

            if (!(modules.num.convertSciToStandard(grp).includes("."))) {
                return modules.num.convertSciToStandard(grp) + ".0";
            }
            return modules.num.convertSciToStandard(grp);
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


        if (JSON.stringify(exp) === "[]") {
            exp = new modules.nullType._Null();
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
        if (isInt(exp) || isString(exp) || isFloat(exp) || isTable(exp) || exp + "" === "null") {
            return exp;
        }

        // //Pass (do nothing)
        // if (exp[0] === "pass") {
        //     return new modules.nullType._Null();
        // }



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

        // stack++;

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
            } else if (instanceEnv instanceof modules.enumType._Enum) {
                return (instanceEnv[name] === undefined ? new modules.nullType._Null() : instanceEnv[name]);
            } else {
                return instanceEnv.lookup(name);
            }
        }

        if (exp[0] === 'class') {
            const [_tag, name, parent, body] = exp;
            var parentEnv = this.eval(parent, env, true);
            if (parentEnv.toString() === "null") {
                parentEnv = env;
            }

            const classEnv = new Environment({ "__class__": new modules.nullType._Null() }, parentEnv);

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

        if (exp[0] === 'enum') {
            const [_tag, name, ...body] = exp;
            return env.define(name, new modules.enumType._Enum(...body));
        }

        if (exp[0] === 'module') {
            const [_tag, name, body] = exp;
            const moduleEnv = new Environment({}, env);
            this._evalBody(body, moduleEnv);
            return env.define(name, moduleEnv);
        }

        if (exp[0] === 'import') {
            const [_tag, url] = exp;
            var thePath = path.join(__dirname, url._toString());

            var moduleSrc = fs.readFileSync(thePath, 'utf8')
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
            // console.log("**"+JSON.stringify(exp));
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



        if (exp[0] === "for") {
            exp = this._transformer.transformForToWhile(exp);
            return this.eval(exp, env, true);
        }

        if (exp[0] === "+=" || exp[0] === "+=") {
            exp = this._transformer.transformPlusEquals(exp);
            return this.eval(exp, env, true);
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


        modules.quit.quit(`Unimplemented: ${JSON.stringify2(exp)}`);
    }

    _callUserDefinedFunction(fn, args) {
        while (args.length < fn.params.length) {
            args.push(new modules.nullType._Null())
        }

        const activationRecord = { "vargv": new modules.tuple._Tuple(...args) };
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

        if (result === undefined) {
            return new modules.nullType._Null();
        }

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

function removeComments(toBeStrippedStr) {
    //LEXER
    function Lexer() {
        this.setIndex = false;
        this.useNew = false;
        for (var i = 0; i < arguments.length; ++i) {
            var arg = arguments[i];
            if (arg === Lexer.USE_NEW) {
                this.useNew = true;
            }
            else if (arg === Lexer.SET_INDEX) {
                this.setIndex = Lexer.DEFAULT_INDEX;
            }
            else if (arg instanceof Lexer.SET_INDEX) {
                this.setIndex = arg.indexProp;
            }
        }
        this.rules = [];
        this.errorLexeme = null;
    }

    Lexer.NULL_LEXEME = {};

    Lexer.ERROR_LEXEME = {
        toString: function () {
            return "[object Lexer.ERROR_LEXEME]";
        }
    };

    Lexer.DEFAULT_INDEX = "index";

    Lexer.USE_NEW = {};

    Lexer.SET_INDEX = function (indexProp) {
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee.apply(this, arguments);
        }
        if (indexProp === undefined) {
            indexProp = Lexer.DEFAULT_INDEX;
        }
        this.indexProp = indexProp;
    };

    (function () {
        var New = (function () {
            var fs = [];
            return function () {
                var f = fs[arguments.length];
                if (f) {
                    return f.apply(this, arguments);
                }
                var argStrs = [];
                for (var i = 0; i < arguments.length; ++i) {
                    argStrs.push("a[" + i + "]");
                }
                f = new Function("var a=arguments;return new this(" + argStrs.join() + ");");
                if (arguments.length < 100) {
                    fs[arguments.length] = f;
                }
                return f.apply(this, arguments);
            };
        })();

        var flagMap = [
            ["global", "g"]
            , ["ignoreCase", "i"]
            , ["multiline", "m"]
            , ["sticky", "y"]
        ];

        function getFlags(regex) {
            var flags = "";
            for (var i = 0; i < flagMap.length; ++i) {
                if (regex[flagMap[i][0]]) {
                    flags += flagMap[i][1];
                }
            }
            return flags;
        }

        function not(x) {
            return function (y) {
                return x !== y;
            };
        }

        function Rule(regex, lexeme) {
            if (!regex.global) {
                var flags = "g" + getFlags(regex);
                regex = new RegExp(regex.source, flags);
            }
            this.regex = regex;
            this.lexeme = lexeme;
        }

        Lexer.prototype = {
            constructor: Lexer

            , addRule: function (regex, lexeme) {
                var rule = new Rule(regex, lexeme);
                this.rules.push(rule);
            }

            , setErrorLexeme: function (lexeme) {
                this.errorLexeme = lexeme;
            }

            , runLexeme: function (lexeme, exec) {
                if (typeof lexeme !== "function") {
                    return lexeme;
                }
                var args = exec.concat(exec.index, exec.input);
                if (this.useNew) {
                    return New.apply(lexeme, args);
                }
                return lexeme.apply(null, args);
            }

            , lex: function (str) {
                var index = 0;
                var lexemes = [];
                if (this.setIndex) {
                    lexemes.push = function () {
                        for (var i = 0; i < arguments.length; ++i) {
                            if (arguments[i]) {
                                arguments[i][this.setIndex] = index;
                            }
                        }
                        return Array.prototype.push.apply(this, arguments);
                    };
                }
                while (index < str.length) {
                    var bestExec = null;
                    var bestRule = null;
                    for (var i = 0; i < this.rules.length; ++i) {
                        var rule = this.rules[i];
                        rule.regex.lastIndex = index;
                        var exec = rule.regex.exec(str);
                        if (exec) {
                            var doUpdate = !bestExec
                                || (exec.index < bestExec.index)
                                || (exec.index === bestExec.index && exec[0].length > bestExec[0].length)
                                ;
                            if (doUpdate) {
                                bestExec = exec;
                                bestRule = rule;
                            }
                        }
                    }
                    if (!bestExec) {
                        if (this.errorLexeme) {
                            lexemes.push(this.errorLexeme);
                            return lexemes.filter(not(Lexer.NULL_LEXEME));
                        }
                        ++index;
                    }
                    else {
                        if (this.errorLexeme && index !== bestExec.index) {
                            lexemes.push(this.errorLexeme);
                        }
                        var lexeme = this.runLexeme(bestRule.lexeme, bestExec);
                        lexemes.push(lexeme);
                        index = bestRule.regex.lastIndex;
                    }
                }
                return lexemes.filter(not(Lexer.NULL_LEXEME));
            }
        };
    })();

    if (!Array.prototype.filter) {
        Array.prototype.filter = function (fun) {
            var len = this.length >>> 0;
            var res = [];
            var thisp = arguments[1];
            for (var i = 0; i < len; ++i) {
                if (i in this) {
                    var val = this[i];
                    if (fun.call(thisp, val, i, this)) {
                        res.push(val);
                    }
                }
            }
            return res;
        };
    }

    Array.prototype.last = function () {
        return this[this.length - 1];
    };

    RegExp.prototype.getFlags = (function () {
        var flagMap = [
            ["global", "g"]
            , ["ignoreCase", "i"]
            , ["multiline", "m"]
            , ["sticky", "y"]
        ];

        return function () {
            var flags = "";
            for (var i = 0; i < flagMap.length; ++i) {
                if (this[flagMap[i][0]]) {
                    flags += flagMap[i][1];
                }
            }
            return flags;
        };
    })();

    RegExp.concat = function (/*r1, r2, ..., rN [, flagMerger] */) {
        var regexes = Array.prototype.slice.call(arguments);
        var regexStr = "";
        var flags = (regexes[0].getFlags && regexes[0].getFlags()) || "";
        var flagMerger = RegExp.concat.INTERSECT_FLAGS;
        if (typeof regexes.last() === "function") {
            flagMerger = regexes.pop();
        }
        for (var j = 0; j < regexes.length; ++j) {
            var regex = regexes[j];
            if (typeof regex === "string") {
                flags = flagMerger(flags, "");
                regexStr += regex;
            }
            else {
                flags = flagMerger(flags, regex.getFlags());
                regexStr += regex.source;
            }
        }
        return new RegExp(regexStr, flags);
    };

    (function () {
        function setToString(set) {
            var str = "";
            for (var prop in set) {
                if (set.hasOwnProperty(prop) && set[prop]) {
                    str += prop;
                }
            }
            return str;
        }

        function toSet(str) {
            var set = {};
            for (var i = 0; i < str.length; ++i) {
                set[str.charAt(i)] = true;
            }
            return set;
        }

        function union(set1, set2) {
            for (var prop in set2) {
                if (set2.hasOwnProperty(prop)) {
                    set1[prop] = true;
                }
            }
            return set1;
        }

        function intersect(set1, set2) {
            for (var prop in set2) {
                if (set2.hasOwnProperty(prop) && !set2[prop]) {
                    delete set1[prop];
                }
            }
            return set1;
        }

        RegExp.concat.UNION_FLAGS = function (flags1, flags2) {
            return setToString(union(toSet(flags1), toSet(flags2)));
        }

        RegExp.concat.INTERSECT_FLAGS = function (flags1, flags2) {
            return setToString(intersect(toSet(flags1), toSet(flags2)));
        };

    })();

    RegExp.prototype.group = function () {
        return RegExp.concat("(?:", this, ")", RegExp.concat.UNION_FLAGS);
    };

    RegExp.prototype.optional = function () {
        return RegExp.concat(this.group(), "?", RegExp.concat.UNION_FLAGS);
    };

    RegExp.prototype.or = function (regex) {
        return RegExp.concat(this, "|", regex, RegExp.concat.UNION_FLAGS).group();
    };

    RegExp.prototype.many = function () {
        return RegExp.concat(this.group(), "*", RegExp.concat.UNION_FLAGS);
    };

    RegExp.prototype.many1 = function () {
        return RegExp.concat(this.group(), "+", RegExp.concat.UNION_FLAGS);
    };

    function id(x) {
        return x;
    }

    /*************************************************************************************/

    var eof = /(?![\S\s])/m;
    var newline = /\r?\n/m;
    var spaces = /[\t ]*/m;
    var leadingSpaces = RegExp.concat(/^/m, spaces);
    var trailingSpaces = RegExp.concat(spaces, /$/m);

    var lineComment = /\/\/(?!@).*/m;
    var blockComment = /\/\*(?!@)(?:[^*]|\*[^/])*\*\//m;
    var comment = lineComment.or(blockComment);
    var comments = RegExp.concat(comment, RegExp.concat(spaces, comment).many());
    var eofComments = RegExp.concat(leadingSpaces, comments, trailingSpaces, eof);
    var entireLineComments = RegExp.concat(leadingSpaces, comments, trailingSpaces, newline);

    var lineCondComp = /\/\/@.*/;
    var blockCondComp = /\/\*@(?:[^*]|\*[^@]|\*@[^/])*@*\*\//;

    var doubleQuotedString = /"(?:[^\\"]|\\.)*"/;
    var singleQuotedString = /'(?:[^\\']|\\.)*'/;

    var regexLiteral = /\/(?![/*])(?:[^/\\[]|\\.|\[(?:[^\]\\]|\\.)*\])*\//;

    var anyChar = /[\S\s]/;

    /*************************************************************************************/


    var stripper = new Lexer();

    stripper.addRule(entireLineComments, Lexer.NULL_LEXEME);

    stripper.addRule(
        RegExp.concat(newline, entireLineComments.many(), eofComments)
        , Lexer.NULL_LEXEME
    );

    stripper.addRule(
        RegExp.concat(comment, RegExp.concat(trailingSpaces, newline, eofComments).optional())
        , Lexer.NULL_LEXEME
    );

    stripper.addRule(lineCondComp, id);
    stripper.addRule(blockCondComp, id);

    stripper.addRule(doubleQuotedString, id);
    stripper.addRule(singleQuotedString, id);

    stripper.addRule(regexLiteral, id);

    stripper.addRule(anyChar, id);

    /*************************************************************************************/

    return stripper.lex(toBeStrippedStr).join("");
}

var intmodulus = 274876858369;
var seed = new modules.int._Int(+new Date() % intmodulus);
var modulus = new modules.int._Int(intmodulus);
//Blum-Blum-Shub generator
function rand() {
    seed = seed.mul(seed).mod(modulus);
    return seed;
}

//Builtins
var GlobalEnvironment = new Environment({
    null: new modules.nullType._Null(),
    true: new modules.trit._Trit("1"),
    unknown: new modules.trit._Trit("0"),
    false: new modules.trit._Trit("N"),
    Math: new Environment({
        PI: new modules.rat._Rat(Math.PI),
        E: new modules.rat._Rat(Math.E),
        sin: function sin(a) {
            if (!(a instanceof modules.rat._Rat)) {
                //Cast
                return GlobalEnvironment.lookup(type(a))(sin(GlobalEnvironment.lookup("rat")(a)));
            } else {
                a = a.mod(GlobalEnvironment.lookup("Math").lookup("PI").mul(2)).sub(1);
                var pow = (x, y) => (y === 0 ? new modules.rat._Rat(1, 1) : x.mul(pow(x, y - 1))); //Q&D int power
                // console.log(pow(new modules.rat._Rat(2,1),3).decimalValue());
                //Taylor series
                var coefs = [0.8414709848078965, 0.5403023058681398, -0.42073549240394825, -0.09005038431135662, 0.03506129103366235, 0.004502519215567831, -0.0011687097011220786, -0.00010720283846590075, 0.000020869816091465686, 1.4889283120263993e-6, -2.3188684546072984e-7, -1.353571192751272e-8, 1.7567185262176504e-9, 8.676738415072256e-11, -9.652299594602475e-12, -4.1317801976534555e-13, 4.021791497751031e-14, 1.519036837372594e-15, -1.3143109469774612e-16, -4.441628179452029e-18, 3.45871301836174e-19, 1.0575305189171499e-20, -7.486391814635802e-22, -2.089981262682114e-23, 1.3562304012021378e-24, 3.4833021044701907e-26, -2.08650830954175e-27, -4.961968809786596e-29, 2.7599316263779767e-30, 6.110799026830784e-32, -3.172335202733306e-33];
                var result = new modules.rat._Rat(0, 1);
                for (var i = 0; i < coefs.length; i++) {
                    result = result.add(pow(a, i).mul(coefs[i]));
                }

                return result;

            }
        },
        cos: function cos(a) {
            if (!(a instanceof modules.rat._Rat)) {
                //Cast
                return GlobalEnvironment.lookup(type(a))(cos(GlobalEnvironment.lookup("rat")(a)));
            } else {
                a = a.mod(GlobalEnvironment.lookup("Math").lookup("PI").mul(2)).sub(1);
                var pow = (x, y) => (y === 0 ? new modules.rat._Rat(1, 1) : x.mul(pow(x, y - 1))); //Q&D int power
                // console.log(pow(new modules.rat._Rat(2,1),3).decimalValue());
                //Taylor series
                var coefs = [0.5403023058681398, -0.8414709848078965, -0.2701511529340699, 0.1402451641346494, 0.022512596077839158, -0.007012258206732471, -0.0007504198692613052, 0.00016695852873172549, 0.000013400354808237594, -0.0000023188684546072986, -1.4889283120263993e-7, 2.1080622314611804e-8, 1.1279759939593935e-9, -1.3513219432443465e-10, -6.197670296480184e-12, 6.43486639640165e-13, 2.5823626235334097e-14, -2.3657597045594303e-15, -8.439093540958856e-17, 6.91742603672348e-18, 2.2208140897260144e-19, -1.6470061992198763e-20, -4.806956904168863e-22, 3.2549529628851306e-23, 8.708255261175476e-25, -5.424921604808551e-26, -1.3397315786423809e-27, 7.727808553858335e-29, 1.772131717780927e-30, -9.517005608199921e-32, -2.0369330089435944e-33];
                var result = new modules.rat._Rat(0, 1);
                for (var i = 0; i < coefs.length; i++) {
                    result = result.add(pow(a, i).mul(coefs[i]));
                }

                return result;

            }
        },
        tan: function tan(a) {
            if (!(a instanceof modules.rat._Rat)) {
                //Cast
                return GlobalEnvironment.lookup(type(a))(tan(GlobalEnvironment.lookup("rat")(a)));
            } else {
                var sin = GlobalEnvironment.lookup("Math").lookup("sin");
                var cos = GlobalEnvironment.lookup("Math").lookup("cos")
                return sin(a).div(cos(a));

            }
        },
        exp: function exp(a) {
            if (!(a instanceof modules.rat._Rat)) {
                //Cast
                return GlobalEnvironment.lookup(type(a))(exp(GlobalEnvironment.lookup("rat")(a)));
            } else {
                // a = a.mod(GlobalEnvironment.lookup("Math").lookup("PI").mul(2)).sub(1);
                var pow = (x, y) => (y === 0 ? new modules.rat._Rat(1, 1) : x.mul(pow(x, y - 1))); //Q&D int power
                var coefs = [1, 1, 1 / 2, 1 / 6, 1 / 24, 1 / 120, 1 / 720, 1 / 5040, 1 / 40320, 1 / 362880, 1 / 3628800, 1 / 39916800, 1 / 479001600, 1 / 6227020800, 1 / 87178291200, 1 / 1307674368000, 1 / 20922789888000, 1 / 355687428096000, 1 / 6402373705728000, 1 / 121645100408832000, 1 / 2432902008176640000, 1 / 51090942171709440000, 1 / 1124000727777607680000, 1 / 25852016738884976640000, 1 / 620448401733239439360000, 1 / 15511210043330985984000000, 1 / 403291461126605635584000000, 1 / 10888869450418352160768000000, 1 / 304888344611713860501504000000, 1 / 8841761993739701954543616000000, 1 / 265252859812191058636308480000000];
                var result = new modules.rat._Rat(0, 1);
                for (var i = 0; i < coefs.length; i++) {
                    result = result.add(pow(a, i).mul(coefs[i]));
                }

                return result;

            }
        },
        // log: function log(a) {
        //     if (!(a instanceof modules.rat._Rat)) {
        //         //Cast
        //         return GlobalEnvironment.lookup(type(a))(log(GlobalEnvironment.lookup("rat")(a)));
        //     } else {
        //         var pow = (x, y) => (y === 0 ? new modules.rat._Rat(1, 1) : x.mul(pow(x, y - 1))); //Q&D int power
        //         var result = a;
        //         for (var i = 2; i < 300; i++) {
        //             var t1 = Math.pow(-1, i + 1);
        //             result = result.add(pow(a, i).div(i).mul(t1));
        //         }

        //         return result;

        //     }
        // },
        'abs'(op1) {
            return op1.abs();
        },
        'sign'(op1) {
            if (op1.decimalValue && op1.decimalValue() === 0)
                return op1
            var abs = GlobalEnvironment.lookup("Math").lookup("abs");
            return op1.div(abs(op1));

        },
        'random'() {
            var theRand = rand();
            var num = GlobalEnvironment.lookup("num");
            return new modules.rat._Rat(theRand, modulus);
        }

    }),
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

        if (table instanceof Environment) {
            return new modules.int._Int(Object.getOwnPropertyNames(table.record).length);
        }

        return new modules.int._Int(Object.getOwnPropertyNames(table.hashes).length);
    },
    'keys'(table) {
        if (table instanceof modules.tuple._Tuple) {
            var result = new modules.table._Table();
            for (var i = 0; i < table.toArray().length; i++) {
                result.set(new modules.int._Int(i), new modules.int._Int(i));
            }

            return result;
        } else if (table instanceof Environment) {
            return toTernary(Object.getOwnPropertyNames(table.record));
        } else if (table instanceof modules.enumType._Enum) {
            var result = new modules.table._Table();
            for (var i = 0; i < Object.getOwnPropertyNames(table).length; i++) {
                result.set(new modules.int._Int(i), new modules.string._String(Object.getOwnPropertyNames(table)[i]) /*table[Object.getOwnPropertyNames(table)[i]]*/);
            }

            return result;
        } else {
            return toTernary(Object.getOwnPropertyNames(table.hashes).map((e) => JSON.parse(e)));
        }
    },
    'values'(table) {
        if (table instanceof modules.tuple._Tuple) {
            var result = new _Table();
            for (var i = 0; i < table.toArray().length; i++) {
                result.set(new modules.int._Int(i), new modules.int._Int(table.toArray()[i]));
            }
            return result;
        } else if (table instanceof Environment) {
            return toTernary(Object.getOwnPropertyNames(table.record).map((e) => table.lookup(e)));
        } else if (table instanceof modules.enumType._Enum) {
            var result = new modules.table._Table();
            for (var i = 0; i < Object.getOwnPropertyNames(table).length; i++) {
                result.set(new modules.int._Int(i), table[Object.getOwnPropertyNames(table)[i]]);
            }

            return result;
        } else {
            return toTernary(Object.getOwnPropertyNames(table.hashes).map((e) => table.get(JSON.parse(e))));
        }
    },
    'trit'(...args) {
        if (JSON.stringify(args) === "[]") {
            return new modules.trit._Trit("N");
        } else if (args[0].toString() === "unknown") {
            return new modules.trit._Trit("0");
        } else if (args[0].toString() === "0") {
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
            case "table": return new modules.rat._Rat(...tableToTuple(args[0]).toArray())
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
            case "environment":
                return modules.table._Table.from(args[0].record)
            default:
                var result = new modules.table._Table()
                for (var i = 0; i < args.length; i++) {
                    result.set(new modules.int._Int(i), args[i]);
                }
                return result;

        }
    },
    'assert'(a) {
        if (falsey(a)) {
            modules.quit.quit("AssertionError")
        }
        return new modules.nullType._Null();
    }

})


//Export
module.exports = Owlet;
