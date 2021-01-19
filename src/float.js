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
function _Float(a) {
    if (a instanceof _Float) {
        Object.assign(this, a);
    } else if (typeof a === 'number') {
        //Switch gears: The user is requesting conversion from JS number.
        // console.log(a,scale.decimalValue(),a*scale.decimalValue());
        a = BigInteger(Math.floor(a*scale.decimalValue()));
        this.a = new int._Int(int._Int.bigToBT(a));
    } else {
        this.a = new int._Int(a);
    }
}

_Float.prototype.add = function (that) {
    that = new _Float(that);
    return new _Float(this.a.add(that.a));
}

_Float.prototype.sub = function (that) {
    that = new _Float(that);
    return new _Float(this.a.sub(that.a));
}

_Float.prototype.mul = function (that) {
    that = new _Float(that);
    return new _Float(this.a.mul(that.a).div(scale));
}


_Float.prototype.div = function (that) {
    that = new _Float(that);
    return new _Float(this.a.mul(scale).div(that.a));
}


_Float.prototype.mod = function (that) {
    that = new _Float(that);

    return new _Float(this.a.mod(that.a));
}


_Float.prototype.decimalValue = function () {
    return this.a.decimalValue() / scale.decimalValue();
}

_Float.prototype.bigIntValue = function () {
    return this.a.bigIntValue().divide(scale.bigIntValue());
}

_Float.prototype.compareTo = function (that) {
    if (this.decimalValue() > that.decimalValue())
        return 1;
    else if (this.decimalValue() === that.decimalValue())
        return 0;
    return -1;
}


_Float.prototype.neg =  function() {
    return this.mul(-1);
}

_Float.prototype.abs = function () {
    if (this.compareTo(new _Float(0)) < 0)
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

_Float.prototype.toJSON = function() {
    return this.toString();
}
_Float.prototype.toString = function () {
    var intPart = this.bigIntValue().toString();
    var fracPart = (digits(this.mod(1).a.bigIntValue()) || "0").split("-").pop();
    return intPart + "." + fracPart;
}



//Export
module.exports = { _Float, scale, digits }