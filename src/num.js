const int = require("./int.js")
const scale = new int._Int("1" + "0".repeat(30)); //The scale for fixed-point numbers
// const bigIntScale = scale;
const BigInteger = require("big-integer")
const clone = (orig) => { return Object.assign(Object.create(Object.getPrototypeOf(orig)), orig) };
//Polyfill for old browsers

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length > targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
}

/**
 * This module defines a decimal number represented using a fixed-point number system. 
 * @param {*} x 
 * @param {*} s 
 */
function _Num(a) {
    if (a instanceof _Num) {
        Object.assign(this, a);
    } else if (typeof a === 'number') {
        //Switch gears: The user is requesting conversion from JS number.
        a = BigInteger(Math.floor(a*scale.decimalValue()));
        this.a = new int._Int(int._Int.bigToBT(a));
    } else {
        this.a = new int._Int(a);
    }
}

/**
 * Adds two nums
 */

_Num.prototype.add = function (that) {
    that = new _Num(that);
    return new _Num(this.a.add(that.a));
}

/**
 * Subtracts two nums
 */
_Num.prototype.sub = function (that) {
    that = new _Num(that);
    return new _Num(this.a.sub(that.a));
}

/**
 * Product of two nums
*/

_Num.prototype.mul = function (that) {
    that = new _Num(that);
    return new _Num(this.a.mul(that.a).div(scale));
}


/**
 * Quotient of two nums
*/
_Num.prototype.div = function (that) {
    that = new _Num(that);
    return new _Num(this.a.mul(scale).div(that.a));
}



/**
 * Modulo
 */

_Num.prototype.mod = function (that) {
    that = new _Num(that);

    return new _Num(this.a.mod(that.a));
}


_Num.prototype.decimalValue = function () {
    return this.a.decimalValue() / scale.decimalValue();
}

_Num.prototype.bigIntValue = function () {
    return this.a.bigIntValue().divide(scale.bigIntValue());
}

_Num.prototype.compareTo = function (that) {
    if (this.decimalValue() > that.decimalValue())
        return 1;
    else if (this.decimalValue() === that.decimalValue())
        return 0;
    return -1;
}


_Num.prototype.neg =  function() {
    return this.mul(-1);
}

_Num.prototype.abs = function () {
    if (this.compareTo(new _Num(0)) < 0)
        return this.neg();
    return this;
}

function digits(x) {
    var scaleDigits = BigInteger("10", 1e100).divide(scale.bigIntValue());
    var numDigits = Math.log10(scale)+scaleDigits.toString().length-1;
    var result = ((scaleDigits.times(BigInteger(x))).toString().padStart(Math.ceil(numDigits), "0")
        .substr(0, 12).replace(/0+$/, ''));
    return result;
}

_Num.prototype.toJSON = function() {
    return this.toString();
}
_Num.prototype.toString = function () {
    var intPart = this.bigIntValue().toString();
    var fracPart = (digits(this.mod(1).a.bigIntValue()) || "0").split("-").pop();
    return intPart + "." + fracPart;
}



//Export
module.exports = { _Num, scale, digits }