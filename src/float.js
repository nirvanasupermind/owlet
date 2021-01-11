const int = require("./int.js")
const scale = /*new int._Int(2000)*/new int._Int("1" + "0".repeat(10)); //The scale for fixed-point numbers
const scaledec = scale.decimalValue();
const b = new int._Int(3).mul(scale);
const clone = (orig) => { return Object.assign(Object.create(Object.getPrototypeOf(orig)), orig) };
/**
 * This module defines a decimal number in a logarithmic number system (LNS), or the log3 of a fixed-point number. 
 * @param {*} x 
 * @param {*} s 
 */
function _Float(x, s) {
    if (typeof x === 'number' && s == null) {
        //Switch gears: The user is requesting conversion from native javascript number.
        var lg = Math.log(x) / Math.log(3);
        lg *= scaledec;
        lg = Math.floor(lg);

        this.x = new int._Int(lg);
        this.s = Math.sign(x);
    } else {
        if(s == null)
            s = 1;
        this.x = new int._Int(x);
        this.s = Math.sign(s);
    }
}


/**
 * Fixed-point addition
 * @param {*} a 
 * @param {*} b 
 */
function add(a, b) {
    return a.add(b);
}

/**
 * Fixed-point subtraction
 * @param {*} a 
 * @param {*} b 
 */

function sub(a, b) {
    return a.sub(b);
}

/**
 * Fixed-point multiplication
 * @param {*} a 
 * @param {*} b 
 */
function mul(a, b) {
    return a.mul(b).div(scale);
}

/**
 * Fixed-point division
 * @param {*} a 
 * @param {*} b 
 */
function div(a, b) {
    if (b.value === '0')
        throw new Error('division by zero')
    //scale=50
    //1.5/2
    //(75)/(100)
    //

    return a.mul(scale).div(b);
}

/**
 * Fixed-point power (integer)
 */
function pow1(x, y) {
    var result = fix(1);
    for (var i = 0; i < y; i++) {
        result = mul(result, x)
    }

    return result;
}


/**
 * Convert the JS number to fixed point
 * @param {number} a 
 */
function fix(a) {
    var result = Math.floor(a * scaledec);
    return new int._Int(result);
}

/**
 * Fixed-point exponential function
 * @param {*} x
 */
function exp(x) {
    //Deal with negative numbers
    if (x.value.charAt(0) === 'N') {
        return div(fix(1), exp(x.neg()));
    }
    var coefs = [1, 1, 0.5, 0.16666666666666666, 0.041666666666666664, 0.008333333333333333,
        0.001388888888888889, 0.0001984126984126984, 0.0000248015873015873, 0.0000027557319223985893,
        2.755731922398589e-7, 2.505210838544172e-8, 2.08767569878681e-9, 1.6059043836821613e-10,
        1.1470745597729725e-11, 7.647163731819816e-13, 4.779477332387385e-14].map(fix);

    var result = new int._Int(0);
    //Taylor series
    for (var i = 0; i < coefs.length; i++) {
        var t1 = pow1(x, i);
        var t2 = mul(coefs[i], t1);
        result = add(result, t2);
    }

    return result;

}

/**
 * Fixed-point natural logarithm
 */
function ln(x) {
    var x2 = x.decimalValue() / scaledec;
    var result = new int._Int(0);
    var sresult = 0;
    // if (x2 < 1) {
    //Initial guess based on power series
    for (var i = 1; i < 50; i += 2) {
        var t1 = div(sub(x, fix(1)), add(x, fix(1)));
        var s1 = (x2 - 1) / (x2 + 1);
        var t2 = pow1(t1, i);
        var s2 = Math.pow(s1, i);
        var t3 = mul(div(fix(1), fix(i)), t2);
        var s3 = s2 / i;
        result = add(result, t3);
        sresult += s3;
    }

    result = add(result, result);
    sresult *= 2;
    // }

    //Newton iteration
    var xn = result;
    for (var i = 0; i < 20; i++) {
        // console.log("Just before the old: "+xn)
        var t1 = exp(xn.neg());
        var t2 = exp(xn).sub(x);
        var t3 = mul(t1, t2);
        xn = xn.sub(t3);
        // console.log(`
        //     (i,${i})
        //     (t1,${t1.decimalValue()/scaledec})
        //     (t2,${t2.decimalValue()/scaledec})
        //     (t3,${t3.decimalValue()/scaledec})
        //     (imresult,${xn.decimalValue()/scaledec})
        // `)
    }

    return xn;
}


/**
 * Fixed-point logarithm with base
 * @param {*} x 
 * @param {*} b 
 */
function log(x, b) {
    return div(ln(x), ln(b));
}

/**
 * Fixed-point power
 * @param {*} x 
 * @param {*} y 
 */
function pow(x, y) {
    return exp(mul(y, ln(x)));
}

/**
 * Gaussian logarithm 1
 * @param {*} z 
 */
function sb(z) {
    var t1 = pow(b, z);
    var t2 = add(fix(1), t1);
    return log(t2, b);
}

/**
 * Gaussian logarithm 2
 * @param {*} z 
 */
function db(z) {
    var t1 = pow(b, z);
    var t2 = sub(fix(1), t1).abs();
    return log(t2, b);
}

/**
 * Converts float to native number
 */

_Float.prototype.decimalValue = function () {
    return Math.pow(3, this.x.decimalValue() / scale.decimalValue()) * this.s;
}

/**
 * Adds two floats
 */
_Float.prototype.add = function (that) {
    var x = this.x;
    var y = that.x;
    var t1 = sb(sub(y, x));
    return new _Float(add(x, t1));
}

/**
 * Subtract two floats
 */
_Float.prototype.sub = function(that) {
  var x = this.x;
    var y = that.x;
    var t1 = db(sub(y, x));
    return new _Float(add(x, t1))
}
/**
 * Product of two floats
*/
_Float.prototype.mul = function (that) {
    return new _Float(add(this.x, that.x), this.s * that.s);
}


/**
 * Quotient of two floats
 */
_Float.prototype.div = function (that) {
    return new _Float(sub(this.x, that.x), this.s * that.s);
}


_Float.prototype.compareTo = function(that) {
    if(this.decimalValue() > that.decimalValue()) {
        return 1;
    } else if(this.decimalValue() === that.decimalValue()) {
        return 0;
    } else {
        return -1;
    }
}

_Float.prototype.toString = function() {
    return this.decimalValue().toString();
}

_Float.prototype.toJSON = _Float.prototype.toString;
//Export
module.exports = { _Float, scaledec/*, pow, exp, fix*/ }