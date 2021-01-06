/**
 * This module implements the arbitrary-precision rational numbers or the FatRat
 */

const int = require("./int.js");

/**
 * Highest common divisor of two ints
 * @param {*} a 
 * @param {*} b 
 */
function gcd(a, b) {
    console.log({a,b})
    if (b.value === '0')
        return a;
    else
        return gcd(b, (a.mod(b)));
}

/**
 * Creates a rational number, with numerator and denominator.
 * @param {*} n
 * @param {*} d
 */
function _Rat(n, d) {
    n = new int._Int(n);
    d = new int._Int(d);

    this.n = n.div(gcd(n,d));
    this.d = d.div(gcd(n,d));
}


module.exports = { _Rat }