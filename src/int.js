import * as trit from "./trit.js"
import * as quit from "./quit.js"

/**
  * This module defines an integer, stored as a string in balanced ternary.
  * Credits to RosettaCode and Justin Fay for making part of the code
 */


function _Int(s) {
    if (typeof s === "string") {
        for (var i = 0; i < s.length; i++) {
            if (!"01N".includes(s.charAt(i))) {
                throw new Error("Invalid trits provided to construct an int");
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
    } else if (typeof s === "bigint") {
        s = _Int.bigToBT(s);
    } else if (Array.isArray(s)) {
        s = s.join("");
    }
    s = s.toString();


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

_Int.mod3 = function (v) {
    if (v > 0)
        return v % 3;
    v = v % 3;
    return (v + 3) % 3;
}

_Int.convertToBT = function (v) {
    if (v === 0) {
        return "0";
    }
    var R = (n, d = (n % 3 + 3) % 3) => n ? R((n - d) / 3 + (d > 1)) + '01N'[d] : '';
    return R(v);
}


_Int.bigToBT = function (v) {
    if (v === 0) {
        return "0";
    }
    var R = (n, d = (n % BigInt(3) + BigInt(3)) % BigInt(3)) => n ? R((n - d) / BigInt(3) + BigInt(d > BigInt(1))).toString() + '01N'[Number(d)] : '';
    return R(v);
}


_Int.prototype.intValue = function () {
    var result = 0;
    for (var i = 0; i < this.length(); i++) {
        var j = this.length() - i - 1;
        result += new trit._Trit(this.value.charAt(i)).intValue() * Math.pow(3, j);
    }

    return result;
}


_Int.prototype.bigIntValue = function () {
    var result = BigInt(0);
    for (var i = 0; i < this.length(); i++) {
        var j = this.length() - i - 1;
        var t1 = new trit._Trit(this.value.charAt(i)).intValue();
        result += BigInt(t1) * BigInt(3) ** BigInt(j);
    }

    return result;
}

//Number of trits in an int
_Int.prototype.length = function () {
    return this.value.length;
}

//UTIL exponet by 3
_Int.exp = function (n) {
    return new _Int("1" + "0".repeat(n));
}

//Lengthens two arguments to the same length
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

//Bitwise NOT or Negation
_Int.prototype.neg = function () {
    var result = "";
    for (var i = 0; i < this.length(); i++) {
        result += new trit._Trit(this.value.charAt(i)).not();
    }
    return new _Int(result);
}

//Bitwise AND
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

//Bitwise OR
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


//Bitwise XOR
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

//Addition

_Int.prototype.add = function (that) {
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
        var digisum = _Int.addDigits(a.charAt(place), b.charAt(place), carry);
        if (digisum.length != 1)
            carry = digisum.charAt(0);
        else
            carry = '0';
        sum = digisum.charAt(digisum.length - 1) + sum;
    }
    sum = carry + sum;

    return new _Int(sum);
}


//subtraction
_Int.prototype.sub = function (that) {
    that = new _Int(that);

    return this.add(that.neg());
}


_Int.prototype.multiplyTrit = function (that) {
    //Multiply by a single trit
    if (that.ch === "N") {
        return this.neg();
    } else if (that.ch === "0") {
        return new _Int("0");
    } else {
        return this;
    }
}

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

//multiplication
_Int.prototype.mul = function (that) {
    that = new _Int(that);



    //Multiply of two ints
    var result = new _Int("0");
    for (var i = 0; i < that.length(); i++) {
        var j = that.length() - i - 1;
        //Multiply trit-by-trit
        result = result.add(this.multiplyTrit(new trit._Trit(that.value.charAt(i))).lshift(j));
    }

    return result;
}


//division (manual method)
_Int.prototype.div = function (that) {
    that = new _Int(that);

    var one = new _Int("1");
    var zero = new _Int("0");
    var div = new _Int("0");
    var temp = this;

    if (that.compareTo(zero) === -1) {
        that = that.neg();
        flipflag = 1;
    }


    while (temp.compareTo(zero) >= 0) {
        temp = temp.sub(that);
        div = div.add(one);
    }

    return div;

}

//modulo (remainder)
_Int.prototype.mod = function (that) {
    that = new _Int(that);

    var one = new _Int("1");
    var zero = new _Int("0");
    var div = new _Int("0");
    var temp = this;

    if (that.compareTo(zero) === -1) {
        that = that.neg();
        flipflag = 1;
    }


    while (temp.compareTo(zero) >= 0) {
        temp = temp.sub(that);
        div = div.add(one);
    }

    return temp.neg();

}

_Int.prototype.isEven = function () {
    var a = this;
    while (a.value.length > 1) {
        a = a.value.split("").reduce((a, b) => new _Int(a).add(new _Int(b)));
    }

    if (a.value === "0")
        return true;
    if (a.value === "")
        return true;

    return false;
}

_Int.prototype.isOdd = function () {
    return !this.isEven();
}

_Int.mod2 = function (a) {
    if (a.isEven()) {
        return new _Int("0");
    } else {
        return new _Int("1");
    }
}


//division, but more efficient for small numbers
function divide(a, b, q = new _Int(0)) {
    if (a.compareTo(b) === -1) {
        return [q, a];
    }
    return divide(a.sub(b), b, q.add(1));
}


_Int.prototype.div_efficient = function (that) {
    that = new _Int(that);
    return divide(this, that);
}

//scrapped long division (can't translate to ternary)
/*
//https://www.geeksforgeeks.org/divide-large-number-represented-string/
// A function to perform division of large numbers 
    static string longDivision(string number, int divisor) 
    { 
        // As result can be very large store it in string 
        string ans = ""; 
  
        // Find prefix of number that is larger 
        // than divisor. 
        int idx = 0; 
        int temp = (int)(number[idx] - '0'); 
        while (temp < divisor) { 
            temp = temp * 10 + (int)(number[idx + 1] - '0'); 
            idx++; 
        } 
        ++idx; 
  
        // Repeatedly divide divisor with temp. After 
        // every division, update temp to include one 
        // more digit. 
        while (number.Length > idx) { 
            // Store result in answer i.e. temp / divisor 
            ans += (char)(temp / divisor + '0'); 
  
            // Take next digit of number 
            temp = (temp % divisor) * 10 + (int)(number[idx] - '0'); 
            idx++; 
        } 
        ans += (char)(temp / divisor + '0'); 
  
        // If divisor is greater than number 
        if (ans.Length == 0) 
            return "0"; 
  
        // else return ans 
        return ans; 
    } 

*/
// _Int.prototype.div = function (that) {
//     that = new _Int(that);
//         function divide(dd) { # the last position that divisor* val <  dd
//             s, r = 0, 0
//             for (var i = 0; i < 9; i++) {
//                 tmp = s + divisor
//                 if (tmp <= dd) {
//                     s = tmp
//                 }
//                 else {
//                     return str(i), str(dd-s)
//                 }
//             }
//             return str(9), str(dd-s)
//         }

//         if dividend == 0:
//             return 0
//         sign = -1
//         if (dividend >0 and divisor >0 ) or (dividend < 0 and divisor < 0):
//             sign = 1
//         dividend = abs(dividend)
//         divisor = abs(divisor)
//         if divisor > dividend:
//             return 0
//         ans, did, dr = [], str(dividend), str(divisor)
//         n = len(dr)
//         pre = did[:n-1]
//         for i in range(n-1, len(did)):
//             dd = pre+did[i]
//             dd = int(dd)
//             v, pre = divide(dd)
//             ans.append(v)

//         ans = int(''.join(ans))*sign
// }



_Int.prototype.equals = function (that) {
    return this.value === (that.value);
}

_Int.prototype.compareTo = function (that) {
    that = new _Int(that);
    if (this.intValue() > that.intValue())
        return 1;
    else if (this.intValue() === that.intValue())
        return 0;
    return -1;
}

_Int.prototype.toString = function () {
    return this.bigIntValue().toString();
}



BigInt.prototype.toJSON = function() {
    return this.toString(10);
}


_Int.prototype.toJSON = function() {
    return this.bigIntValue().toString(10);
}


export { _Int }

