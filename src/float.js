const BigInteger = require("big-integer");
const int = require("./int.js");
const quit = require("./quit.js");



var PRECISION = 42;
var TOLERANCE = 0.05;

// a is the significant number
// range of a is from -3 to 3
// b is the exponent number
// range of b is -inf to inf

/**
 * This module defines a float, which is stored as a multiple of a power of 3.
*/
function _Float(a, b) {
    //Need the significand to be [PRECISION] trits
    a = a.lshift(PRECISION - a.value.length);

    b = b.add(a.value.length - PRECISION)
    a.value = a.value.substr(0, PRECISION);

    this.a = a;
    this.b = b;
}

//SCRAPPED:Allocate two random numbers to infinity and NaN
// _Float.INFINITY_DOUBLE = 4376095554823691;
// _Float.NAN_DOUBLE = 2989567416709247;

//converts from decimal to float
_Float.fromDecimal = function (n) {
    if (n < 0)
        return _Float.fromDecimal(-n).neg();
    if (Math.abs(n) <= 1) {
        var _n = n + 1;
        var result = _Float.fromDecimal(_n).sub(new _Float(int._Int.ONE, int._Int.ZERO));
        while (result.decimalValue() > n) {
            result = result.mul(new _Float(new int._Int("1"), new int._Int("N")));
        }

        while (result.decimalValue() < n) {
            result = result.mul(new _Float(int._Int.ONE, int._Int.ONE))
        }

        return result;
    } else {
        var _n = n;
        while (_n % 3 !== 0) {
            _n *= 3;
        }
        var a = new int._Int(int._Int.convertToBT(_n));
        var b = new int._Int(int._Int.convertToBT(Math.ceil(Math.fround(Math.log(n) / Math.log(3)))));
        //console.log(n, Math.ceil(Math.fround(Math.log(n) / Math.log(3))));
        return new _Float(a, b);
    }
}


_Float.prototype.decimalValue = function () {
    //The decimal value of a float
    return this.a.intValue() * Math.pow(3, this.b.intValue()) * Math.pow(3, -PRECISION + 1);
}


_Float.prototype.bigIntValue = function () {
    return new BigInteger(Math.floor(this.decimalValue()));
}

_Float.prototype.neg = function () {

    return new _Float(this.a.neg(), this.b);
}

//addition

_Float.prototype.add = function (that) {
    var _this = this;
    var _that = that;

    while (_this.b.compareTo(_that.b) > 0) {
        _this.a = new int._Int(_this.a.value + "0");
        _this.b = _this.b.sub(1);
    }

    return new _Float(_this.a.add(_that.a), _this.b);
}

//subtraction
_Float.prototype.sub = function (that) {

    return this.add(that.neg());
}

//multiplication
_Float.prototype.mul = function (that) {
    if (that.a === "0") {
        return that;
    }
    return new _Float(this.a.mul(that.a).shorter(PRECISION), this.b.add(that.b));
}

//compare
_Float.prototype.compareTo = function (that) {
    if (this.b.compareTo(that.b) !== 0) {
        return this.b.compareTo(that.b);
    } else {
        return this.a.compareTo(that.a);
    }
}


_Float.prototype.div = function (that) {
    var xa = this.a;
    var xb = this.b;
    var ya = that.a;
    var yb = that.b;

    while (ya.value.length > xa.value.length) {
        xa.value = xa.value + "0"
    }

    while (xa.value.length < ya.value.length) {
        ya.value = ya.value + "0"
    }

    while (yb.intValue() > xb.intValue()) {
        xa.value = "0" + xa.value;
        xb = xb.add(1);
    }


    // while (xb.intValue() > yb.intValue()) {

    //     xa.value = "0" + xa.value();
    //     xb = xb.add(1);

    // }

    var za = xa.shorter(12).div_efficient(ya.shorter(3))[0];

    return new _Float(za, xb.sub(yb));

}


_Float.prototype.toString = function () {
    if (this.compareTo(new _Float(int._Int.ZERO, int._Int.ONE)) < 0) {
        return "-" + this.neg().toString();
    }

    if (this.decimalValue() < Number.MAX_SAFE_INTEGER) {
        return this.decimalValue().toString();
    }

    var a = this.bigIntValue();
    var b = this.decimalValue() % 1;
    if (!isFinite(this.decimalValue())) {
        b = 0;
    }

    if (a.toString().length > 21) {
        var lognum = this.b.intValue() * Math.log10(3);
        var sig = Math.pow(10, lognum % 1);
        var exp = Math.floor(lognum);
        return sig + "e" + exp;
    }

    return a + "." + b;
}

//Override the pretty printer
// _Float.prototype.toString = function () {
//     if (!isFinite(this.intValue)) {
//         var lognum = this.b.intValue() * Math.log10(3);
//         return Math.pow(10, lognum % 1) + "e" + Math.floor(lognum).toString().replace(/e\+/g, "e");
//     } else if (this.intValue() % 1 === 0 && !this.intValue.includes("e")) {
//         return this.intValue() + ".0";
//     } else {
//         return this.intValue().toString().replace(/\e+/g, "e");
//     }
// }


_Float.prototype.round = function () {
    var idx = this.b.intValue();
    var a2 = this.a.value.split("");

    for (var i = idx + 1; i < a2.length; i++) {
        a2[i] = "0";
    }

    return new _Float(a2.join(""), this.b);
}

_Float.prototype.toJSON = _Float.prototype.decimalValue;
module.exports = { _Float }
