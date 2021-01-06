/**
 * This module defines a grammar for the Owlet language. 
 * It can convert the C-style syntax to Lisp-style syntax used on owlet.js. 
 * Will be using jneen's Parsimmon to do this.
 */

const Parsimmon = require("parsimmon")
// Defines a Parsimmon grammar for parsing Owlet code: a subset of JavaScript s
var Lang = Parsimmon.createLanguage({
    // Helpers
    eos: function () {
        return Parsimmon.string(";");
    },
    //Comments and whitespace 
    fullComment: function () {
        return Parsimmon.regexp(/\*.*?\*/g)
    },
    lineComment: function () {
        return Parsimmon.regexp(new RegExp("//.*$"));
    },
    comment: function (r) {
        return r.fullComment.or(r.lineComment);
    },
    _: function () {
        return Parsimmon.optWhitespace;
    },




});



Lang.Value.tryParse("(list 1 2 foo (list nice 3 56 989 asdasdas))");
