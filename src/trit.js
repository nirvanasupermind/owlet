const quit = require('./quit.js')
const BigInteger = require("big-integer")

//util
Object.prototype.clone = function () {
    var instanceOfBlah = this;
    var Blah = this.constructor;
    const clone = Object.assign({}, instanceOfBlah);
    Object.setPrototypeOf(clone, Blah.prototype);
    return clone;
}

/**
  * This module defines a trit (ternary digit), which can be {-1,0,1}.
 */


function _Trit(ch) {
    var a = ch;
    if (a instanceof _Trit) {
        this.ch = a;
    } else if (typeof a === "number") {
        if (a === -1) {
            this.ch = "N";
        } else {
            this.ch = Math.sign(a);
        }
    } else if (typeof a === "string") {
        switch (ch) {
            case "0":
            case "unknown":
                this.ch = "0";
                break;
            case "1":
            case "true":
                this.ch = "1";
                break;
            case "N":
            case "false":
                this.ch = "N";
                break;
            default:
                console.log("This is a string case:" + ch);
                quit.quit("Invalid trit: " + ch);
        }
    }

}



//NOT operator
_Trit.prototype.not = function () {
    var result = "0";

    if (this.ch === "1") {
        result = "N";
    }

    if (this.ch === "N") {
        result = "1";
    }


    return new _Trit(result);
}

//AND operator
_Trit.prototype.and = function (that) {
    //Casting
    that = new _Trit(that);

    var result = "N";
    if (this.ch === "1" && that.ch === "1") {
        result = "1";
    }

    if (this.ch === "0" || that.ch === "0") {	// UNKNOWN
        result = "0";
    }

    return new _Trit(result);
}

//OR operator
_Trit.prototype.or = function (that) {
    //Casting
    that = new _Trit(that);
    var result = "N";

    if (this.ch === "1" || that.ch === "1") {
        result = "1";
    }

    if (this.ch === "N" || that.ch === "N") {
        result = "N";
    }
    if (this.ch === "0" || that.ch === "0") {
        result = "0";
    }

    return new _Trit(result);
}

//XOR operator
_Trit.prototype.xor = function (that) {
    //Casting
    that = new _Trit(that);

    var A = this;
    var B = that;
    //NAND construction
    function nand(a, b) {
        return a.and(b).not();
    }

    return nand(nand(A, nand(A, B)), nand(B, nand(A, B)));
}


//Override the pretty printer
// _Trit.prototype.prettyPrint = function () {
//     if (this.ch === "1") {
//         return "true";
//     } else if (this.ch === "0") {
//         return "unknown";
//     } else {
//         return "false";
//     }
// }

//this toString used for compilation
_Trit.prototype._toString = function () {
    if (this.ch === "1") {
        return "true";
    } else if (this.ch === "0") {
        return "unknown";
    } else {
        return "false";
    }
}
_Trit.prototype.toString = function () {
    return this.ch;
}

_Trit.prototype.intValue = function () {
    if (this.ch === "N") {
        return -1;
    }

    return parseFloat(this.ch);
}


_Trit.prototype.bigIntValue = function () {
    if (this.ch === "N") {
        return BigInteger(-1);
    }

    return BigInteger(parseFloat(this.ch));
}

module.exports = { _Trit }

//This code is contributed by JohnSully 