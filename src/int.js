const BigInteger = require("big-integer");
const trit = require("./trit.js");
const quit = require("./quit.js");

/**
  * This module defines an arbitrary-precision integer, stored as a string in balanced ternary.
  * Credits to RosettaCode and WallyWest for making part of the code
 */


function _Int(s) {
    if (typeof s === "string") {
        for (var i = 0; i < s.length; i++) {
            if (!"01N".includes(s.charAt(i))) {
                throw new Error("Invalid trits provided to construct an int: " + JSON.stringify(s));
            }
        }
    }
    if (s === "") {
        this.value = "0";
    } else if (s instanceof _Int) {
        Object.assign(this, s);
        return;
    } else if (typeof s === "number") {
        s = _Int.convertToBT(s);
    } else if (Array.isArray(s)) {
        s = s.join("");
    }

    s = (s || "").toString();


    var i = 0;
    while (s.charAt(i) == "0")
        i++;

    s = s.substring(i);
    if (s === "") {
        s = "0";
    }

    this.value = s;

}

_Int.MINUS_ONE = new _Int("N");
_Int.ZERO = new _Int("0");
_Int.ONE = new _Int("1");

/**
 * Performs signed modulo 3
 */

_Int.mod3 = function (v) {
    if (v > 0)
        return v % 3;
    v = v % 3;
    return (v + 3) % 3;
}

/**
 * Converts integer to balanced ternary
 */

_Int.convertToBT = function (v) {
    if (v === 0) {
        return "0";
    }
    var t = a => { v = ""; if (0 == a) v = "0"; else for (a = (N = 0 > a) ? -a : a; a;)v = "01N"[r = (a % 3 + 3) % 3] + v, 2 == r && ++a, a = a / 3 | 0; return v }
    var t2 = a => { 
        if(a < 0) {
            return t(a).split("").map((e) => ({'0':'0','1':'N','N':'1'})[e]).join("")
        } else {
            return t(a);
        }
    }
    return t2(v);
}

/**
 * Converts arbitrary-precision integer to balanced ternary
 */

_Int.bigToBT = function (n) {
    var output = "";
    while (n > 0) {

        n = new BigInteger(n);
        var rem = n.remainder(3);
        n = n.divide(3);
        if (rem == 2) {
            rem = -1;
            n++;
        }
        output = (rem == 0 ? '0' :
            (rem == 1) ? '1' : 'N') + output;
    }
    return output;
}
/**
 * Converts integer to native number
 */

_Int.prototype.decimalValue = function () {
    var result = 0;
    for (var i = 0; i < this.length(); i++) {
        var j = this.length() - i - 1;
        result += new trit._Trit(this.value.charAt(i)).decimalValue() * Math.pow(3, j);
    }

    return result;
}

/**
 * Converts integer to BigInteger: this is needed to print the number accurately.
 */
_Int.prototype.bigIntValue = function () {
    // if(this.value[0] === "N") {
    // return this.neg().bigIntValue();
    // }
    var result = new BigInteger(0);
    for (var i = 0; i < this.length(); i++) {
        var j = this.length() - i - 1;
        var t1 = new trit._Trit(this.value.charAt(i)).bigIntValue();
        result += new BigInteger(t1).times(new BigInteger(3).pow(new BigInteger(j)));
    }

    return result;
}

/**
Number of trits in an int
*/
_Int.prototype.length = function () {
    return this.value.length;
}

/**
 * Util exponent by 3
 */
_Int.exp = function (n) {
    return new _Int("1" + "0".repeat(n));
}

/** 
 * Lengthens two arguments to the same length
 * @param {*} a
 * @param {*} b
*/
_Int.lengthen = function (a, b) {
    a = a.value;
    b = b.value;
    var longer = a.length > b.length ? a : b;
    var shorter = a.length > b.length ? b : a;

    while (shorter.length < longer.length)
        shorter = "0" + shorter;

    a = longer;
    b = shorter;

    return { a: a, b: b };
}

/**
 * Tritwise NOT or Negation
*/
_Int.prototype.neg = function () {
    var result = "";
    for (var i = 0; i < this.length(); i++) {
        result += new trit._Trit(this.value.charAt(i)).not();
    }
    return new _Int(result);
}

/**
 * Tritwise AND
 */
_Int.prototype.and = function (that) {
    that = new _Int(that);
    var a = _Int.lengthen(this, that).a;
    var b = _Int.lengthen(this, that).b;
    var result = "";
    for (var i = 0; i < a.length; i++) {
        result += new trit._Trit(a.charAt(i)).and(b.charAt(i)).toString();
    }

    return new _Int(result);
}

/**
 * Tritwise OR
 */
_Int.prototype.or = function (that) {
    that = new _Int(that);

    var a = _Int.lengthen(this, that).a;
    var b = _Int.lengthen(this, that).b;
    var result = "";
    for (var i = 0; i < this.length(); i++) {
        result += new trit._Trit(a.charAt(i)).or(b.charAt(i)).toString();
    }

    return new _Int(result);
}


/**
 * Tritwise XOR
 */
_Int.prototype.xor = function (that) {
    that = new _Int(that);

    var a = _Int.lengthen(this, that).a;
    var b = _Int.lengthen(this, that).b;
    var result = "";
    for (var i = 0; i < this.length(); i++) {
        result += new trit._Trit(a.charAt(i)).xor(new trit._Trit(b.charAt(i))).toString();
    }

    return new _Int(result);
}

/**
 * Half-add circuit
 */
_Int.addDigits_1 = function (a, b) {

    var sum = "";
    if (a == '0')
        sum = b + "";
    else if (b == '0')
        sum = a + "";
    else if (a == "1") {
        if (b == "1")
            sum = "1N";
        else
            sum = "0";
    } else {
        if (b == "1")
            sum = "0";
        else
            sum = "N1";
    }
    return sum;
}

/**
 * Full add circuit
 */
_Int.addDigits = function (a, b, carry) {
    var sum1 = _Int.addDigits_1(a, b);
    var sum2 = _Int.addDigits_1(sum1.charAt(sum1.length - 1), carry);
    //System.out.println(carry+" "+sum1+" "+sum2);
    if (sum1.length == 1)
        return sum2;
    if (sum2.length == 1)
        return sum1.charAt(0) + sum2;
    return sum1.charAt(0) + "";
}

/**
 * Adds two ints
 */

_Int.prototype.add = function (that) {
    //Cast
    that = new _Int(that);
    var a = this.value;
    var b = that.value;


    var longer = a.length > b.length ? a : b;
    var shorter = a.length > b.length ? b : a;

    while (shorter.length < longer.length)
        shorter = "0" + shorter;

    a = longer;
    b = shorter;

    var carry = '0';
    var sum = "";
    for (var i = 0; i < a.length; i++) {
        var place = a.length - i - 1;
        //compute the digit
        var digisum = _Int.addDigits(a.charAt(place), b.charAt(place), carry);
        if (digisum.length != 1)
            //compute the carry
            carry = digisum.charAt(0);
        else
            carry = '0';
        sum = digisum.charAt(digisum.length - 1) + sum;
    }
    sum = carry + sum;

    return new _Int(sum);
}


/**
 * Subtracts two ints
 */
_Int.prototype.sub = function (that) {
    that = new _Int(that);

    return this.add(that.neg());
}

/**
 * Multiply by a single trit
 */
_Int.prototype.multiplyTrit = function (that) {
    if (that.ch === "N") {
        return this.neg();
    } else if (that.ch === "0") {
        return new _Int("0");
    } else {
        return this;
    }
}

/**
 * Ternary lshift with native number
 */
_Int.prototype.lshift = function (x) {
    var result = this.value;
    for (var i = 0; i < x; i++) {
        result += "0";
    }
    return new _Int(result);
}



_Int.prototype.shorter = function (i) {
    return new _Int(this.value.substr(0, i));
}


/**
 * Product of two ints
*/
_Int.prototype.mul = function (that) {
    that = new _Int(that);


    var result = new _Int("0");
    for (var i = 0; i < that.length(); i++) {
        var j = that.length() - i - 1;
        //Multiply trit-by-trit
        result = result.add(this.multiplyTrit(new trit._Trit(that.value.charAt(i))).lshift(j));
    }

    return result;
}




//division function
function divide(a, b) {
    var result = new _Int("N");
    var a2 = a.clone();
    //Manual subtraction
    while (a2.compareTo(new _Int(0)) >= 0) {
        a2 = a2.sub(b);
        result = result.add(1);
    }

    return [result, a2];
}


/**
 * Quotient of two ints
 */

_Int.prototype.div = function (that) {
    return divide(this, that)[0];
}




/**
 * modulo (remainder)
*/
_Int.prototype.mod = function (that) {
    return that.add(divide(this, that)[1]);

}

/**
 * Absolute value
 */
_Int.prototype.abs = function () {
    if (this.compareTo(_Int.ZERO) < 0) {
        return this.neg();
    }

    return this;
}


/**
 * Equality
 */
_Int.prototype.equals = function (that) {
    return this.value === (that.value);
}

/**
 * Performs a comparison between two numbers. 
 * If the numbers are equal, it returns 0. If the first number is greater, it returns 1. 
 * If the first number is lesser, it returns -1.
 */
_Int.prototype.compareTo = function (that) {
    that = new _Int(that);
    if (this.decimalValue() > that.decimalValue())
        return 1;
    else if (this.decimalValue() === that.decimalValue())
        return 0;
    return -1;
}



_Int.prototype.toString = function () {
    return this.bigIntValue().toString();
}

//JSON formatting

BigInteger.prototype.toJSON = function () {
    return this.toString(10);
}


_Int.prototype.toJSON = function () {
    return this.bigIntValue().toString(10);
}

/**
 * Minimum
 */
_Int.min = function (a, b) {
    if (a.compareTo(b) < 0) {
        return a;
    } else {
        return b;
    }
}

/**
 * Maximum
 */
_Int.max = function (a, b) {
    if (a.compareTo(b) > 0) {
        return a;
    } else {
        return b;
    }
}


//Export
module.exports = { _Int }

