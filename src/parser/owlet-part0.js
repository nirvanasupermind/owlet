/**
 * This is an implementation of Owlet parser that can only parse and evaluate numerical int expressions.
 * Expressions consists of numbers and the operators +,-,*,/,%,&,|,^
 * Credits to  jMichael for making part of the code
 */

import { Parsimmon } from "../util/parsimmon.js"
import * as modules from "../modules.js"
function flags(re) {
    if (re.flags !== undefined) {
        return re.flags;
    }
    // legacy browser support
    return [
        re.global ? "g" : "",
        re.ignoreCase ? "i" : "",
        re.multiline ? "m" : "",
        re.unicode ? "u" : "",
        re.sticky ? "y" : ""
    ].join("");
}

function anchoredRegexp(re) {
    return RegExp("^(?:" + re.source + ")$", flags(re));
}

Array.prototype.reduce2 = function (f, acc) {
    let { length } = this;
    const noAcc = arguments.length < 2;
    if (noAcc && length === 0) throw new TypeError(REDUCE_ERROR);
    let result = noAcc ? this[--length] : acc;
    while (length > 0) result = f(this[--length], result, length, this);
    return result;
};

//Casts input to a  integer
function castInt(a) {
    if (!a.match(/\b0[zZ][01N]+\b|[-+]?\b\d+\b/g) || a.match(/(\b[0-9]+\.([0-9]+\b)?|\.[0-9]+\b)/g)) {
        modules.quit.quit("Unhandled literal: " + a);
    }
    //Deal with ternary affix
    if (a.substr(0, 2) === "0z") {
        return new modules.int._Int(a.substr(2));
    } else {
        return new modules.int._Int(modules.int._Int.convertToBT(parseFloat(a)));
    }
}



function operator(method) {
    return function () {
        var vargv = [].slice.call(arguments);
        return vargv.reduce2((a, b) => a[method](b));
    };
}

function evaluate1(expr) {

    var chars = expr.split("");
    var n = [], op = [], index = 0, oplast = true;

    n[index] = "";

    // Parse the expression
    for (var c = 0; c < chars.length; c++) {

        if (isNaN(parseInt(chars[c])) && chars[c] !== "." && !oplast) {
            op[index] = chars[c];
            index++;
            n[index] = "";
            oplast = true;
        } else {
            n[index] += chars[c];
            oplast = false;
        }
    }

    // Calculate the expression
    expr = castInt(n[0]);
    for (var o = 0; o < op.length; o++) {
        var num = castInt(n[o + 1]);
        switch (op[o]) {
            case "+":
                expr = operator("add")(expr, num);
                break;
            case "-":
                expr = operator("sub")(expr, num);
                break;
            case "*":
                expr = operator("mul")(expr, num);
                break;
            case "/":
                expr = operator("div")(expr, num);
                break;
            case "%":
                expr = operator("mod")(expr, num);
                break;
            case "&":
                expr = operator("and")(expr, num);
                break;
            case "|":
                expr = operator("or")(expr, num);
                break;
            case "^":
                expr = operator("xor")(expr, num);
                break;
        }
    }

    return expr;
}

function evaluate(expr) {
    return evaluate1(expr);

}



export { evaluate, flags, anchoredRegexp }
