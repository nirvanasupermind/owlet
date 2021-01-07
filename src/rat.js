/**
 * This module implements the arbitrary-precision rational numbers 
 * SCRAPPED, todo: remade on for Version 1.0
 */

const int = require("./int.js");
const BigInteger = require("big-integer")
var stack = 0;

/**
 * Highest common divisor of two ints
 * @param {*} a 
 * @param {*} b 
 */
function gcd_rec(a, b) {
    if (b === 1)
        return 1;
    var gcd = BigInteger.gcd(a.bigIntValue(), b.bigIntValue());
    return new int._Int(int._Int.bigToBT(gcd));
}



/**
 * Farey algorithm The algorithm is related to the Farey sequence
 * @param {number} x 
 * @param {number} N 
 */
var farey = function (x, N) {
    if (x === 0)
        return [0, 1]
    if (x > 1) {
        return [farey(x % 1, N)[0] + Math.floor(x) * farey(x % 1, N)[1], farey(x % 1, N)[1]];
    }
    var a = 0, b = 1;
    var c = 1, d = 1;

    while (b <= N && d <= N) {
        var mediant = (a + c) / (b + d);
        if (x === mediant) {
            if (b + d <= N) {
                return [a + c, b + d]
            } else if (d > b) {
                return [c, d];
            } else {
                return [a, b];
            }
        } else if (x > mediant) {
            a = a + c; b = b + d;
        } else {
            c = a + c; d = b + d;
        }
    }

    if (b > N) {
        return [c, d]
    } else {
        return [a, b];
    }

}


/**
 * Creates a rational number, with numerator and denominator.
 * @param {*} n
 * @param {*} d
 */
function _Rat(n, d) {
    if (typeof n === "number" && d == null) {
        //Switch gears: The user is requesting conversion from native javascript number.
        var [a, b] = farey(n, 1e4).map((e) => new int._Int(e));
        this.n = a;
        this.d = b;
    } else {
        n = new int._Int(n);
        d = new int._Int(d);
        this.n = n.div(gcd_rec(n, d));
        this.d = d.div(gcd_rec(n, d));
    }
}

/**
* Converts rational to native number
 */
_Rat.prototype.decimalValue = function () {
    return this.n.decimalValue() / this.d.decimalValue();
}

/**
 * Negation
*/
_Rat.prototype.neg = function () {
    return new _Rat(this.n.mul(-1),this.d);
}

/**
 * Adds two rational numbers
 */
_Rat.prototype.add = function (that) {
    var a = this.n, b = this.d, c = that.n, d = that.d;
    var t1 = (a.mul(d).add(b.mul(c)));
    var t2 = (b.mul(d));
    return new _Rat(t1,t2);
}

/**
 * Subtracts two rational numbers
 */
_Rat.prototype.sub = function (that) {
    return this.add(that.neg());
}

/**
 * Fractional part of rational number
 */

_Rat.prototype.fracPart = function() {
    return new _Rat(this.n.mod(this.d),this.d);
}

// All the prime numbers under 1,000
var primeNumbers = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];

// Finds all the prime factors of a non-zero integer
// a = integer
function primeFactors(a) {
    var primeFactors = new Array(); 

    // Trial division algorithm
    for (var i = 0, p = primeNumbers[i]; i < primeNumbers.length && p * p <= a; i++, p = primeNumbers[i]) {
        while (a % p == 0) {         
                primeFactors.push(p);

                a /= p;
        }
    }

    if (a > 1) {
        primeFactors.push(a);
    }

    return primeFactors;
}

// Converts a fraction to a decimal
// i = number
// n = numerator
// d = denominator
function fractionToDecimal(n, d) {
    if(d > 200) {
        return (n/d).toString();
    }
    var pFS = primeFactors(d);
    for (var i = 0; i < pFS.length; i++) { // Go through each of the denominators prime factors

        if (pFS[i] !== 2 && pFS[i] !== 5) { // We have a repeating decimal

            var output = new Array();
            var ns = new Array();

            // Let's find the repeating decimal
            // Repeating decimal algorithm - uses long division
            for (var i = 0; i < 100; i++) { // For now find 20 spots, ideally this should stop after it finds the repeating decimal
                // How many times does the denominator go into the numerator evenly
                var temp2 = parseInt(n / d);

                if (ns[n] === undefined) {
                    ns[n] = i;
                } else {
                    return "Repeating decimal: " + 
                        output.slice(0, 1).join('') +
                        '.' +
                        output.slice(1, ns[n]).join('') +
                        '[' + output.slice(ns[n]).join('') + ']'
                    ;
                }

                output.push(temp2);
                var n = n % d;
                n += "0";
            }           
            return "Repeating decimal: " + output;
        }
    }

    // Terminating decimal
    return "Terminating decimal: " + n / d;
}




_Rat.prototype.toString = function () {
    var intPart = this.n.div(this.d).toString();
    var fracPart = fractionToDecimal(this.fracPart().n,this.fracPart().d).split("0.").pop();

    return intPart+"."+fracPart;
    
}

module.exports = { _Rat }