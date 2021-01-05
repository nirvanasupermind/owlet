/**
 * This module defines Ascii string
 */
import * as int from "./int.js"
import * as quit from "./quit.js"
import * as dictionary from "./dictionary.js"

//Here's a table of ascii characters
var asciiTable = {
    "0": "\u0000",
    "1": "\u0001",
    "2": "\u0002",
    "3": "\u0003",
    "4": "\u0004",
    "5": "\u0005",
    "6": "\u0006",
    "7": "\u0007",
    "8": "\u0008",
    "9": "\u0009",
    "10": "\u000a",
    "11": "\u000b",
    "12": "\u000c",
    "13": "\u000d",
    "14": "\u000e",
    "15": "\u000f",
    "16": "\u0010",
    "17": "\u0011",
    "18": "\u0012",
    "19": "\u0013",
    "20": "\u0014",
    "21": "\u0015",
    "22": "\u0016",
    "23": "\u0017",
    "24": "\u0018",
    "25": "\u0019",
    "26": "\u001a",
    "27": "\u001b",
    "28": "\u001c",
    "29": "\u001d",
    "30": "\u001e",
    "31": "\u001f",
    "32": " ",
    "33": "!",
    "34": "\"",
    "35": "#",
    "36": "$",
    "37": "%",
    "38": "&",
    "39": "'",
    "40": "(",
    "41": ")",
    "42": "*",
    "43": "+",
    "44": ",",
    "45": "-",
    "46": ".",
    "47": "/",
    "48": "0",
    "49": "1",
    "50": "2",
    "51": "3",
    "52": "4",
    "53": "5",
    "54": "6",
    "55": "7",
    "56": "8",
    "57": "9",
    "58": ":",
    "59": ";",
    "60": "<",
    "61": "=",
    "62": ">",
    "63": "?",
    "64": "@",
    "65": "A",
    "66": "B",
    "67": "C",
    "68": "D",
    "69": "E",
    "70": "F",
    "71": "G",
    "72": "H",
    "73": "I",
    "74": "J",
    "75": "K",
    "76": "L",
    "77": "M",
    "78": "N",
    "79": "O",
    "80": "P",
    "81": "Q",
    "82": "R",
    "83": "S",
    "84": "T",
    "85": "U",
    "86": "V",
    "87": "W",
    "88": "X",
    "89": "Y",
    "90": "Z",
    "91": "[",
    "92": "\\",
    "93": "]",
    "94": "^",
    "95": "_",
    "96": "`",
    "97": "a",
    "98": "b",
    "99": "c",
    "100": "d",
    "101": "e",
    "102": "f",
    "103": "g",
    "104": "h",
    "105": "i",
    "106": "j",
    "107": "k",
    "108": "l",
    "109": "m",
    "110": "n",
    "111": "o",
    "112": "p",
    "113": "q",
    "114": "r",
    "115": "s",
    "116": "t",
    "117": "u",
    "118": "v",
    "119": "w",
    "120": "x",
    "121": "y",
    "122": "z",
    "123": "{",
    "124": "|",
    "125": "}",
    "126": "~",
    "127": "\u007f"

}


var inverseAsciiTable = {
    "\u0000": "0",
    "\u0001": "1",
    "\u0002": "2",
    "\u0003": "3",
    "\u0004": "4",
    "\u0005": "5",
    "\u0006": "6",
    "\u0007": "7",
    "\u0008": "8",
    "\u0009": "9",
    "\u000a": "10",
    "\u000b": "11",
    "\u000c": "12",
    "\u000d": "13",
    "\u000e": "14",
    "\u000f": "15",
    "\u0010": "16",
    "\u0011": "17",
    "\u0012": "18",
    "\u0013": "19",
    "\u0014": "20",
    "\u0015": "21",
    "\u0016": "22",
    "\u0017": "23",
    "\u0018": "24",
    "\u0019": "25",
    "\u001a": "26",
    "\u001b": "27",
    "\u001c": "28",
    "\u001d": "29",
    "\u001e": "30",
    "\u001f": "31",
    " ": "32",
    "!": "33",
    "\"": "34",
    "#": "35",
    "$": "36",
    "%": "37",
    "&": "38",
    "'": "39",
    "(": "40",
    ")": "41",
    "*": "42",
    "+": "43",
    ",": "44",
    "-": "45",
    ".": "46",
    "/": "47",
    "0": "48",
    "1": "49",
    "2": "50",
    "3": "51",
    "4": "52",
    "5": "53",
    "6": "54",
    "7": "55",
    "8": "56",
    "9": "57",
    ":": "58",
    ";": "59",
    "<": "60",
    "=": "61",
    ">": "62",
    "?": "63",
    "@": "64",
    "A": "65",
    "B": "66",
    "C": "67",
    "D": "68",
    "E": "69",
    "F": "70",
    "G": "71",
    "H": "72",
    "I": "73",
    "J": "74",
    "K": "75",
    "L": "76",
    "M": "77",
    "N": "78",
    "O": "79",
    "P": "80",
    "Q": "81",
    "R": "82",
    "S": "83",
    "T": "84",
    "U": "85",
    "V": "86",
    "W": "87",
    "X": "88",
    "Y": "89",
    "Z": "90",
    "[": "91",
    "\\": "92",
    "]": "93",
    "^": "94",
    "_": "95",
    "`": "96",
    "a": "97",
    "b": "98",
    "c": "99",
    "d": "100",
    "e": "101",
    "f": "102",
    "g": "103",
    "h": "104",
    "i": "105",
    "j": "106",
    "k": "107",
    "l": "108",
    "m": "109",
    "n": "110",
    "o": "111",
    "p": "112",
    "q": "113",
    "r": "114",
    "s": "115",
    "t": "116",
    "u": "117",
    "v": "118",
    "w": "119",
    "x": "120",
    "y": "121",
    "z": "122",
    "{": "123",
    "|": "124",
    "}": "125",
    "~": "126",
    "\u007f": "127"

}

//Caret notation
var caretTable = {};
var charset = "@ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [ \ ]  _".split(" ");
for (var i = 0; i < charset.length; i++) {
    caretTable[i.toString()] = "^" + charset[i];
}
caretTable["127"] = "^?";

//Gets string from ASCII hashes
function fromASCII(a) {
    var filtered = Object.getOwnPropertyNames(a.hashes)/*.filter(function (e) {
        return parseFloat(e) >= 0;
    })*/.map((e) => a.hashes[e]);


    a = filtered.map((e) => asciiTable[e.intValue()]);
    return a.join("");
}

function fromCaret(a) {
    var filtered = Object.getOwnPropertyNames(a.hashes).filter(function (e) {
        e = Object.assign(new int._Int(), JSON.parse(e));
        if (e.intValue) {
            return e.intValue() >= 0;
        } else {
            return false
        }
    }).map((e) => a.hashes[e]);


    a = filtered.map((e) => caretTable[e.intValue()] || asciiTable[e.intValue()]);
    return a.join("");
}

function toASCII(str) {
    var dict = new dictionary._Dictionary();
    for (var i = 0; i < str.length; i++) {
        dict.set(new int._Int(i), new int._Int(parseFloat(inverseAsciiTable[str.charAt(i)])));
        // dict.set(new int._Int(-i - 1), new int._Int(parseFloat(inverseAsciiTable[str.charAt(str.length - i)])));

    }

    return dict;
}

var len = Object.getOwnPropertyNames(asciiTable).length;

function _String(value) {
    if (value === undefined || value === null) {
        value = "";
    }

    if (typeof value !== "object") {
        value = toASCII(value.toString());
    }

    // if (Object.getOwnPropertyNames(value.hashes).some((e) => e.compareTo(len) >= 0)) {
    //     quit.quit("The string " + fromASCII(value) + " is not ASCII compliant.");
    // }

    this.value = value;

}

_String.prototype.toString = function () {
    return fromASCII(this.value);
}

//Need JSON for dictionary addresses
_String.prototype.toJSON = _String.prototype.toString;

//character length
_String.prototype.length = function () {
    return new int._Int(Object.getOwnPropertyNames(this.value.hashes).length);
}

//charAt, plus python negative index
_String.prototype.charAt = function (i) {
    i = new int._Int(i);

    if (i.compareTo(-this.length()) < 0) {
        return new _String();
    } else if (i.compareTo(this.length()) > 0) {
        return new _String();
    }

    var v = Object.getOwnPropertyNames(this.value.hashes).map((e) => this.value.hashes[e]);
    var result = new dictionary._Dictionary();
    if (i.compareTo(0) < 0) {
        result.set(new int._Int(0), v[this.length().add(i).intValue()]);
    } else {
        result.set(new int._Int(0), v[i.intValue()]);
    }

    return new _String(result);
}

_String.prototype.concat = function (that) {
    var result = new dictionary._Dictionary();
    for (var i = 0; i < this.length(); i++) {
        result.set(new int._Int(i), this.charAt(new int._Int(i)).value.hashes[0]);
    }

    for (var j = 0; j < that.length(); j++) {
        result.set(new int._Int(j).add(this.length()), that.charAt(new int._Int(j)).value.hashes[0]);
    }

    return new _String(result);



}

//substring
_String.prototype.substr = function (a, b) {
    if (b === undefined || b === null) {
        b = this.length();
    }


    a = new int._Int(a);
    b = new int._Int(b);

    if (a.compareTo(0) < 0) {
        a = this.length().add(a);
    }

    if (b.compareTo(0) < 0) {
        b = this.length().add(b);
    }



    var result = new dictionary._Dictionary();
    for (var i = a.intValue(); i < b.intValue(); i++) {
        result.set(new int._Int(i), this.charAt(new int._Int(i)).value.hashes[0]);
    }

    return new _String(result);


}


export { _String };