const int = require("./int.js")
const clone = (orig) => { return Object.assign(Object.create(Object.getPrototypeOf(orig)), orig) };
const vals = [13, 5];
/**
 * This module creates IEEE-style arbitrary-precision float, where a is the scaled up significant number
 * and b is the exponent number. -3 < a < 3, b unlimited range.
 */

function _Float(a, b) {
    if (typeof a === "number" && b == null) {
        //Switch gears: The user is requesting conversion from native javascript number
        if (a === 0) {
            //special case
            this.a = int._Int.ZERO;
            this.b = int._Int.ZERO;
        } else {
            var a2 = a;

            while (a2 % 1 !== 0) {
                a2 *= 3;
            }
            console.log({a2})
            
            this.a = new int._Int(int._Int.convertToBT(a2));
        
            var t1 = Math.log(Math.abs(a)) / Math.log(3);
            this.b = new int._Int(int._Int.convertToBT(Math.floor(t1)));
            // if (Math.pow(3, t1 % 1) < 1) {
            //     this.b = this.b.add(1);
            // }

        }
    } else if (a instanceof _Float) {
        Object.assign(this, a);
    } else {

        //{Ternary}100000 -> 1, 1NN10 -> 1.NN1
        this.a = new int._Int(a);
        this.b = new int._Int(b);
        this.s = function () {
            return new int._Int("1" + "0".repeat(this.b.value.length - 1));
        }
    }
}



/**
 * Converts float to native number
 */

_Float.prototype.decimalValue = function () {
    if (this.a.toString() === "0")
        return 0;

    var a = clone(this.a);
    a = new int._Int(a.value.substr(0, 600));
    var log = Math.log(Math.abs(a.decimalValue())) / Math.log(3);
        console.log(a.decimalValue());
    var scaledDown = Math.pow(3, log % 1) * Math.sign(a.decimalValue()); //Scaled down significand
    var result = scaledDown * Math.pow(3, this.b);
    return result;
}

/**
 * Negation
*/
_Float.prototype.neg = function () {
    return new _Float(this.a.neg(), this.b);
}

/**
 * Absolute value
*/
_Float.prototype.abs = function () {
    return new _Float(this.a.abs(), this.b);
}

/**
 * Performs a comparison between two numbers. 
 * If the numbers are equal, it returns 0. If the first number is greater, it returns 1. 
 * If the first number is lesser, it returns -1.
 */
_Float.prototype.compareTo = function (that) {
    //Deal with negative numbers
    if (this.a.value.charAt(0) === "N" && that.a.value.charAt(0) !== "N") {
        return -1;
    } else if (this.a.value.charAt(0) !== "N" && that.a.value.charAt(0) === "N") {
        return 1;
    } else if (this.a.value.charAt(0) === "N" && that.a.value.charAt(0) === "N") {
        return -1 * this.neg().compareTo(that.neg());
    }



    var _1 = this.a;
    var _2 = this.b;

    function cmp(a, b) {
        if (a < b) {
            return -1
        } else if (a === b) {
            return 0
        } else {
            return 1
        }
    }

    var _this = clone(this);
    var _that = clone(that);
    while (_this.a.value.length < _that.a.value.length) {
        _this.a.value += "0"
    }

    while (_that.a.value.length < _this.a.value.length) {
        _that.a.value += "0"
    }

    return _this.b.compareTo(that.b) || _this.a.compareTo(_that.a);
}


/**
 * Minimum
 */
_Float.min = function (a, b) {
    if (a.compareTo(b) < 0) {
        return a;
    } else {
        return b;
    }
}

/**
 * Maximum
 */
_Float.max = function (a, b) {
    if (a.compareTo(b) > 0) {
        return a;
    } else {
        return b;
    }
}

/**
 * Adds two floats
 */

_Float.prototype.add = function (that) {
    that = new _Float(that);
    if (that.compareTo(new _Float(0, 0)) < 0) {
        return this.sub(that.neg());
    }
    //Make them have the same exponent
    var a = _Float.min(this, that);
    var b = _Float.max(this, that);
    var i = int._Int.ZERO;
    while (i.compareTo(b.b.sub(a.b)) < 0) {
        i = i.add(1);
        b.a.value += "0";
    }
    return new _Float(a.a.add(b.a), b.b);
}

//Subtracts two floats
_Float.prototype.sub = function (that) {
    that = new _Float(that);
    //Make them have the same exponent
    var a = _Float.min(this, that);
    var b = _Float.max(this, that);
    var i = int._Int.ZERO;
    while (i.compareTo(b.b.sub(a.b)) < 0) {
        i = i.add(1);
        b.a.value += "0";
    }
    return new _Float(a.a.sub(b.a), b.b);
}

/**
 * Product of two floats
*/

_Float.prototype.mul = function (that) {
    that = new _Float(that);
    if(that.compareTo(new _Float(3)) >= 0) {
        return  new _Float(this.a.mul(that.a), this.b.add(that.b).sub(1));
    }
    return new _Float(this.a.mul(that.a), this.b.add(that.b));
}


_Float.prototype.div = function (that) {
    that = new _Float(that);
    var a1 = this.a.shorter(vals[0]);
    while (a1.value.length < vals[0]) {
        a1.value += "0";
    }

    var a2 = that.a.shorter(vals[1]);
    while (a2.value.length < vals[1]) {
        a2.value += "0";
    }

    return new _Float(a1.div(a2), this.b.sub(that.b));

}

/**
 * Square root of a float
 */
_Float.prototype.sqrt = function () {
    var x_n = this.mul(1 / 2);
    for (var i = 0; i < 50; i++) {
        console.log(x_n.decimalValue());
        x_n = x_n.sub(x_n.mul(x_n).sub(new _Float(2))).div(x_n.mul(new _Float(2)));
    }

    return x_n;
}

module.exports = { _Float };