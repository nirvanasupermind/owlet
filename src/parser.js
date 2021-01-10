"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/**
 * This module defines a Myna grammar for the Owlet language. 
 * A Myna grammar is a parsing expression grammar (PEG) that generates a 
 * parser which will output a labeled abstract syntax tree (AST) 
 */


var myna_1 = require("myna-parser");
// Defines a Myna grammar for parsing Chickadee code: a subset of JavaScript 
exports.g = new function () {
    var _this = this;
    // Helpers
    this.eos = myna_1.Myna.text(";");
    this.untilEol = myna_1.Myna.advanceWhileNot(myna_1.Myna.end.or(myna_1.Myna.newLine)).then(myna_1.Myna.advanceUnless(myna_1.Myna.end));
    // Comments and whitespace 
    this.fullComment = myna_1.Myna.guardedSeq("/*", myna_1.Myna.advanceUntilPast("*/"));
    this.lineComment = myna_1.Myna.seq("//", this.untilEol);
    this.comment = this.fullComment.or(this.lineComment);
    this.blankSpace = myna_1.Myna.atWs.advance.oneOrMore;
    this.ws = this.comment.or(this.blankSpace).zeroOrMore;
    // Helper for whitespace delimited sequences that must start with a specific value
    function guardedWsDelimSeq() {
        var rules = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rules[_i] = arguments[_i];
        }
        var tmp = [_this.ws];
        for (var i = 0; i < rules.length; ++i) {
            var r = rules[i];
            // TODO: I shouldn't have to setName on the assert rule
            if (i > 0)
                r = myna_1.Myna.assert(r).setName("chickadee", r.name);
            tmp.push(r, _this.ws);
        }
        return myna_1.Myna.seq.apply(myna_1.Myna, tmp);
    }
    function commaDelimited(rule) {
        return myna_1.Myna.RuleTypeToRule(rule).then(myna_1.Myna.seq(",", _this.ws, rule).zeroOrMore).opt;
    }
    // Recursive definition of an expression
    this.expr = myna_1.Myna.delay(function () { return _this.assignmentExpr; }).setName("chickadee", "expr");
    // Recursive definition of a statement
    this.recStatement = myna_1.Myna.delay(function () { return _this.statement; }).setName("chickadee", "recStatement");
    // Recursive definition of a compoudn statement
    this.recCompoundStatement = myna_1.Myna.delay(function () { return _this.compoundStatement; }).setName("chickadee", "recCompoundStatement");
    // Literals
    this.fraction = myna_1.Myna.seq(".", myna_1.Myna.not("."), myna_1.Myna.digit.zeroOrMore);
    this.plusOrMinus = myna_1.Myna.char("+-");
    this.exponent = myna_1.Myna.seq(myna_1.Myna.char("eE"), this.plusOrMinus.opt, myna_1.Myna.digits);
    this.bool = myna_1.Myna.keywords("true", "false").ast;
    this.number = myna_1.Myna.seq(myna_1.Myna.integer, this.fraction.opt, this.exponent.opt, myna_1.Myna.opt("f")).ast;
    // Strings rules
    this.escapeChar = myna_1.Myna.char('\'"\\bfnrtv');
    this.escapedLiteralChar = myna_1.Myna.char('\\').then(this.escapeChar);
    this.stringLiteralChar = myna_1.Myna.notChar("\u005C\u000D\u2028\u2029\u000A\\").or(this.escapedLiteralChar).ast;
    this.doubleQuotedStringContents = myna_1.Myna.not('"').then(this.stringLiteralChar).zeroOrMore.ast;
    this.singleQuotedStringContents = myna_1.Myna.not("'").then(this.stringLiteralChar).zeroOrMore.ast;
    this.doubleQuote = myna_1.Myna.seq('"', this.doubleQuotedStringContents, '"');
    this.singleQuote = myna_1.Myna.seq("'", this.singleQuotedStringContents, "'");
    this.string = this.doubleQuote.or(this.singleQuote).ast;
    // Literals 
    this.literal = myna_1.Myna.choice(this.number, this.bool, this.string).setName("chickadee", "literal");
    // Operators 
    this.relationalOp = myna_1.Myna.choice.apply(myna_1.Myna, "<= >= < >".split(" ")).ast;
    this.equalityOp = myna_1.Myna.choice.apply(myna_1.Myna, "== !=".split(" ")).ast;
    this.prefixOp = myna_1.Myna.choice.apply(myna_1.Myna, "++ -- - !".split(" ")).thenNot('=').ast;
    this.postIncOp = myna_1.Myna.text('++').ast;
    this.postDecOp = myna_1.Myna.text('--').ast;
    this.assignmentOp = myna_1.Myna.choice.apply(myna_1.Myna, "+= -= *= /= %= =".split(" ")).thenNot('=').ast;
    this.additiveOp = myna_1.Myna.choice.apply(myna_1.Myna, "+ -".split(" ")).thenNot('=').ast;
    this.multiplicativeOp = myna_1.Myna.choice.apply(myna_1.Myna, "* / %".split(" ")).thenNot('=').ast;
    this.logicalAndOp = myna_1.Myna.text('&&').ast;
    this.logicalOrOp = myna_1.Myna.text('||').ast;
    this.logicalXOrOp = myna_1.Myna.text('^^').ast;
    this.rangeOp = myna_1.Myna.text('..').ast;
    // Identifiers including special operator indicators 
    this.opSymbol = myna_1.Myna.char('<>=+-*/%^|&$!.[]');
    this.opName = myna_1.Myna.seq("op", this.opSymbol.oneOrMore).ast;
    this.identifier = myna_1.Myna.choice(this.opName, myna_1.Myna.identifier).ast;
    // Urns are used for the language definition and the module name 
    this.urnPart = myna_1.Myna.alphaNumeric.or(myna_1.Myna.char('.-')).zeroOrMore.ast;
    this.urnDiv = myna_1.Myna.choice(':');
    this.urn = this.urnPart.then(this.urnDiv.then(this.urnPart).zeroOrMore).ast;
    this.langVer = this.urn.ast;
    this.moduleName = this.urn.ast;
    // Postfix expressions
    this.funCall = guardedWsDelimSeq("(", commaDelimited(this.expr), ")").ast;
    this.arrayIndex = guardedWsDelimSeq("[", this.expr, "]").ast;
    this.fieldSelect = myna_1.Myna.seq(".", this.identifier).ast;
    this.postfixOp = myna_1.Myna.choice(this.funCall, this.arrayIndex, this.fieldSelect, this.postIncOp, this.postDecOp).then(this.ws);
    // Some of the leaf expressions 
    this.arrayExpr = guardedWsDelimSeq("[", commaDelimited(this.expr), "]").ast;
    this.parenExpr = guardedWsDelimSeq("(", this.expr, ")").ast;
    this.objectField = guardedWsDelimSeq(this.identifier, "=", this.expr, ";").ast;
    this.objectExpr = guardedWsDelimSeq("{", this.objectField.zeroOrMore, "}").ast;
    this.varName = this.identifier.ast;
    // The "var x = y in x * x" expression form or also part of "varDeclStatement"
    this.varNameDecl = this.identifier.ast;
    this.varInitialization = guardedWsDelimSeq("=", this.expr);
    this.varDecl = myna_1.Myna.seq(this.varNameDecl, this.varInitialization).ast;
    this.varDecls = myna_1.Myna.seq(this.varDecl, guardedWsDelimSeq(",", this.varDecl).zeroOrMore).ast;
    this.varExpr = guardedWsDelimSeq(myna_1.Myna.choice(myna_1.Myna.keyword("local"), myna_1.Myna.keyword("global")), this.varDecls, myna_1.Myna.keyword("in"), this.expr).ast;
    // Function definition
    this.funcName = this.identifier.ast;
    this.funcParamName = this.identifier.ast;
    this.funcParam = this.funcParamName.ast;
    this.funcParams = guardedWsDelimSeq("(", commaDelimited(this.funcParam), ")").ast;
    this.funcBodyStatement = this.recCompoundStatement;
    this.funcBodyExpr = guardedWsDelimSeq('=', this.expr, ';');
    this.funcBody = myna_1.Myna.choice(this.funcBodyStatement, this.funcBodyExpr);
    this.funcSig = guardedWsDelimSeq(this.funcName, this.funcParams).ast;
    this.funcDef = guardedWsDelimSeq(myna_1.Myna.keyword("function"), this.funcSig, this.funcBody).ast;
    // Lambda expression 
    this.lambdaArg = this.identifier.ast;
    this.lambdaBody = this.recCompoundStatement.or(this.expr).ast;
    this.lambdaArgsWithParen = myna_1.Myna.seq("(", this.ws, commaDelimited(this.lambdaArg), ")", this.ws);
    this.lambdaArgs = myna_1.Myna.choice(this.lambdaArg, this.lambdaArgsWithParen).ast;
    this.lambdaExpr = myna_1.Myna.seq(this.lambdaArgs, guardedWsDelimSeq("=>", this.lambdaBody)).ast;
    // Leaf expressions (unary expressions)
    this.leafExpr = myna_1.Myna.choice(this.varExpr, this.objectExpr, this.lambdaExpr, this.parenExpr, this.arrayExpr, this.literal, this.varName).then(this.ws).ast;
    // Binary expressions 
    this.postfixExpr = this.leafExpr.then(this.postfixOp.zeroOrMore).ast;
    this.prefixExpr = this.prefixOp.zeroOrMore.then(this.postfixExpr).ast;
    this.multiplicativeExprLeft = this.prefixExpr.ast;
    this.multiplicativeExprRight = guardedWsDelimSeq(this.multiplicativeOp, this.multiplicativeExprLeft).ast;
    this.multiplicativeExpr = this.multiplicativeExprLeft.then(this.multiplicativeExprRight.zeroOrMore).ast;
    this.additiveExprLeft = this.multiplicativeExpr.ast;
    this.additiveExprRight = guardedWsDelimSeq(this.additiveOp, this.additiveExprLeft).ast;
    this.additiveExpr = this.additiveExprLeft.then(this.additiveExprRight.zeroOrMore).ast;
    this.relationalExprLeft = this.additiveExpr.ast;
    this.relationalExprRight = guardedWsDelimSeq(this.relationalOp, this.relationalExprLeft).ast;
    this.relationalExpr = this.relationalExprLeft.then(this.relationalExprRight.zeroOrMore).ast;
    this.equalityExprLeft = this.relationalExpr.ast;
    this.equalityExprRight = guardedWsDelimSeq(this.equalityOp, this.equalityExprLeft).ast;
    this.equalityExpr = this.equalityExprLeft.then(this.equalityExprRight.zeroOrMore).ast;
    this.logicalAndExprLeft = this.equalityExpr.ast;
    this.logicalAndExprRight = guardedWsDelimSeq(this.logicalAndOp, this.logicalAndExprLeft).ast;
    this.logicalAndExpr = this.logicalAndExprLeft.then(this.logicalAndExprRight.zeroOrMore).ast;
    this.logicalXOrExprLeft = this.logicalAndExpr.ast;
    this.logicalXOrExprRight = guardedWsDelimSeq(this.logicalXOrOp, this.logicalXOrExprLeft).ast;
    this.logicalXOrExpr = this.logicalXOrExprLeft.then(this.logicalXOrExprRight.zeroOrMore).ast;
    this.logicalOrExprLeft = this.logicalXOrExpr.ast;
    this.logicalOrExprRight = guardedWsDelimSeq(this.logicalOrOp, this.logicalOrExprLeft).ast;
    this.logicalOrExpr = this.logicalOrExprLeft.then(this.logicalOrExprRight.zeroOrMore).ast;
    this.rangeExprLeft = this.logicalOrExpr.ast;
    this.rangeExprRight = guardedWsDelimSeq(this.rangeOp, this.rangeExprLeft).ast;
    this.rangeExpr = this.rangeExprLeft.then(this.rangeExprRight.opt).ast;
    this.conditionalExprLeft = this.rangeExpr.ast;
    this.conditionalExprRight = guardedWsDelimSeq("?", this.conditionalExprLeft, ":", this.conditionalExprLeft).ast;
    this.conditionalExpr = this.conditionalExprLeft.then(this.conditionalExprRight.zeroOrMore).ast;
    this.assignmentExprLeft = this.conditionalExpr.ast;
    this.assignmentExprRight = guardedWsDelimSeq(this.assignmentOp, this.assignmentExprLeft).ast;
    this.assignmentExpr = this.assignmentExprLeft.then(this.assignmentExprRight.zeroOrMore).ast;
    // Statements 
    this.exprStatement = this.expr.then(this.ws).then(this.eos).ast;
    this.varDeclStatement = guardedWsDelimSeq(myna_1.Myna.keyword("var"), this.varDecls, this.eos).ast;
    this.loopCond = guardedWsDelimSeq("(", this.expr, ")");
    this.forLoop = guardedWsDelimSeq(myna_1.Myna.keyword("for"), "(", myna_1.Myna.keyword("var"), this.identifier, myna_1.Myna.keyword("in"), this.expr, ")", this.recStatement).ast;
    this.whileLoop = guardedWsDelimSeq(myna_1.Myna.keyword("while"), this.loopCond, this.recStatement).ast;
    this.doLoop = guardedWsDelimSeq(myna_1.Myna.keyword("do"), this.recStatement, myna_1.Myna.keyword("while"), this.loopCond).ast;
    this.elseStatement = guardedWsDelimSeq(myna_1.Myna.keyword("else"), this.recStatement);
    this.ifCond = guardedWsDelimSeq("(", this.expr, ")");
    this.ifStatement = guardedWsDelimSeq(myna_1.Myna.keyword("if"), this.ifCond, this.recStatement, this.elseStatement.opt).ast;
    this.compoundStatement = guardedWsDelimSeq("{", this.recStatement.zeroOrMore, "}").ast;
    this.breakStatement = guardedWsDelimSeq(myna_1.Myna.keyword("break"), this.eos).ast;
    this.continueStatement = guardedWsDelimSeq(myna_1.Myna.keyword("continue"), this.eos).ast;
    this.returnStatement = guardedWsDelimSeq(myna_1.Myna.keyword("return"), this.expr.opt, this.eos).ast;
    this.emptyStatement = this.eos.ast;
    this.statement = myna_1.Myna.choice(this.emptyStatement, this.compoundStatement, this.ifStatement, this.returnStatement, this.continueStatement, this.breakStatement, this.forLoop, this.doLoop, this.whileLoop, this.varDeclStatement, this.funcDef, this.exprStatement).then(this.ws);
    this.code = this.statement.zeroOrMore.ast;
};
// Register the grammar, providing a name and the default parse rule
myna_1.Myna.registerGrammar('chickadee', exports.g, exports.g.code);
exports.chickadeeGrammar = myna_1.Myna.grammars['chickadee'];
exports.chickadeeParser = myna_1.Myna.parsers['chickadee'];
exports.chickadeeGrammarString = myna_1.Myna.grammarToString('chickadee');
exports.toSExpression = function() {
    
}
module.exports = exports;