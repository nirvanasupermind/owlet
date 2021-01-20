/**
 * This module implements the arbitrary-precision rational numbers 
 */

const int = require("./int.js");
const BigInteger = require("big-integer")
const quit = require('./quit.js')

//helper
Number.prototype.abs = function () {
    return Math.abs(this);
}

//from https://stackoverflow.com/questions/14002113/how-to-simplify-a-decimal-into-the-smallest-possible-fraction
function getlowestfraction(x0) {
    var eps = 1.0E-15;
    var h, h1, h2, k, k1, k2, a, x;

    x = x0;
    a = Math.floor(x);
    h1 = 1;
    k1 = 0;
    h = a;
    k = 1;

    while (x - a > eps * k * k) {
        x = 1 / (x - a);
        a = Math.floor(x);
        h2 = h1; h1 = h;
        k2 = k1; k1 = k;
        h = h2 + a * h1;
        k = k2 + a * k1;
    }

    return [h, k];
}


function _Rat(n, d) {


    //I think you know what happens now...
    if (typeof d !== 'undefined' && parseInt(d.toString()) === 0) {
        quit.quit("divided by 0");
    }

    //Nested fraction
    if (typeof n === "number" && typeof d === "number" && (n % 1 !== 0 || d % 1 !== 0)) {
        n = Math.floor(n)
        d = Math.floor(d);
    }

    if (n instanceof _Rat) {
        Object.assign(this, n
        );
    } else if (typeof n === "number" && typeof d === "undefined") {
        //Switch gears: The user is requesting conversion from JS number.
        var [h, k] = getlowestfraction(n);
        this.n = new int._Int(int._Int.convertToBT(h));
        this.d = new int._Int(int._Int.convertToBT(k));


    } else if(n instanceof int._Int && typeof d === "undefined") {
        this.n = n;
        this.d = d;
    } else {
        var _n = n.abs();
        var _d = d.abs();
        //Compute HCF to reduce fractions
        var hcf = new int._Int(int._Int.bigToBT(BigInteger.gcd(new int._Int(_n).bigIntValue(), new int._Int(_d).bigIntValue())));
        this.n = new int._Int(n).div(hcf);
        this.d = new int._Int(d).div(hcf);
    }

}

/**
 * Converts rat to native number
 */

_Rat.prototype.decimalValue = function () {
    return this.n.decimalValue() / this.d.decimalValue();
}

/**
 * Adds two rats
 */

_Rat.prototype.add = function (that) {
    that = new _Rat(that);
    var a = this.n,
        b = this.d,
        c = that.n,
        d = that.d;

    return new _Rat(a.mul(d).add(b.mul(c)), b.mul(d));
}


/**
 * Negation
*/
_Rat.prototype.neg = function () {
    return new _Rat(this.n.neg(), this.d);
}

/**
 * Reciprocal
 */
_Rat.prototype.rec = function () {
    return new _Rat(this.d, this.n);
}

/**
 * Absolute value
 */
_Rat.prototype.abs = function () {
    if (this.compareTo(new _Rat(0)) < 0)
        return this.neg();
    return this;
}

/**
 * Subtracts two rats
 */
_Rat.prototype.sub = function (that) {
    that = new _Rat(that);
    return this.add(that.neg());
}


/**
 * Product of two rats
*/
_Rat.prototype.mul = function (that) {
    that = new _Rat(that);
    var a = this.n,
        b = this.d,
        c = that.n,
        d = that.d;

    return new _Rat(a.mul(c), b.mul(d));
}

/**
 * Quotient of two rats
*/
_Rat.prototype.div = function (that) {
    return this.mul(that.rec());
}


/**
 * Round down
 */

_Rat.prototype.floor = function () {
    return new _Rat(this.n.div(this.d),1);
}

/**
 * Modulo
 */

_Rat.prototype.mod = function (that) {
    that = new _Rat(that);
    var a = this.n,
        b = this.d,
        c = that.n,
        d = that.d;

    var t1 = this;
    var t2 = new _Rat(a.mul(d),b.mul(c)).floor().mul(that);
    return t1.sub(t2);

}



/**
 * Performs a comparison between two numbers. 
 * If the numbers are equal, it returns 0. If the first number is greater, it returns 1. 
 * If the first number is lesser, it returns -1.
 */
_Rat.prototype.compareTo = function (that) {
    //Make them same denom
    var n1 = this.n.mul(that.d);
    var n2 = that.n.mul(this.d);
    return n1.compareTo(n2);
}


_Rat.prototype.toString = function () {
    return this.n + "/" + this.d;
}



_Rat.prototype.toJSON = _Rat.prototype.toString;


module.exports = { _Rat }