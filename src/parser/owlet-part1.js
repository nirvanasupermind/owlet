/**
 * This is an implementation of Owlet parser that can only parse and evaluate numerical expressions.
 * Expressions consists of numbers and the operators +,-,*,/,%,&,|,^ for int and +,-,*,/ for float
 * Credits to  jMichael for making part of the code
 */

import { Parsimmon } from "../util/parsimmon.js"
import * as modules from "../modules.js"
import * as part0 from "./owlet-part0.js"


//Casts input to a  float
function castFloat(a) {
    if (!a.match(/(\b[0-9]+\.([0-9]+\b)?|\.[0-9]+\b)/g)) {
         modules.quit.quit("Unhandled literal: "+a);
    }

    return modules.float._Float.fromDecimal(a);
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
    expr = castFloat(n[0]);
    for (var o = 0; o < op.length; o++) {
        var num = castFloat(n[o + 1]);
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
        }
    }

    return expr;
}

function evaluate(expr) {
    if(!expr.match(/(\b[0-9]+\.([0-9]+\b)?|\.[0-9]+\b)/g)) 
        return part0.evaluate(expr);
    return evaluate1(expr);
}


export { evaluate }
