# Table of Contents
1. [0 Lexical Structure](#0-lexical-structure)
    1. [0.1 Comments](#01-comments)
    1. [0.2 Literals](#02-literals)
1. [1 Types, Values, and Variables](#1-types-values-and-variables)
    1. [1.1 Supported Types](#11-supported-types)
# 0 Lexical Structure
This chapter specifies the lexical structure of Owlet. Owlet programs are written using the ASCII character set. 
## 0.1 Comments
A comment is text that the compiler ignores but that is useful for programmers. Comments are normally used to embed annotations in the code. The interpreter treats them as white space. Owlet defines two kinds of comments:
1. `/* text */ `<br />A traditional comment: all the text from the ASCII characters /* to the ASCII characters */ is ignored (as in C and C++).
2. `// text`<br />A single-line comment: all the text from the ASCII characters // to the end of the line is ignored (as in C++).

## 0.2 Literals
A **literal** is the source code representation of a value of a type or the null. There are two types of literals, atoms and lists. Atoms can be further split into these categories:
* Integers, which can be expressed in decimal or balanced ternary numeral systems. A decimal integer is a sequence of digits that are one of `0123456789`. A balanced ternary integer is preceeded by a suffix `0z`, and is a sequence of digits that are one of `01N`.
* Strings, which are a hash table of ASCII characters combined to produce a run of text. They are circumfixed by the character `"` "quote".

## 0.3 Syntax
Owlet uses Lisp-style S-expressions in it's syntax. This means that all expressions are either an atom/literal such as `foo`, or a list of atoms seperated by whitespace such as `(foo 5)`. It is reccomended to put all your code inside a begin statement (*see* Blocks), like this:
```clojure
(begin
    (print "Hello World")
)
```
# 1 Types, Values, and Variables
Owlet is a weakly-typed language, which means that variables are not bound to a specific data type. 

## 1.1 Supported Types
Owlet v0.1 supports the following types:
```
    Trit
    Int
    Float
    Null
```

In v0.1 new types can't be added. [Functions](#2-functions-and-functional-programming) are also a data type, 

### 1.1.1 The Type `Trit`
The `Trit` data type can be storing a three-valued logic in which there are three truth values indicating `true`, `false` and some indeterminate third value (labeled as `unknown` in Owlet). They can also represent balanced ternary digits, and are a superset of booleans. Owlet's implementation of trit is based on [Kleene logic](https://en.wikipedia.org/wiki/Three-valued_logic#Kleene_and_Priest_logics), so the unknown value is falsey. The logical operations `&&`, `||` and `^^` can be perfomed on trits:
```clojure
(print (&& unknown true)) //=> unknown
```

They are also based on Kleene logic.

### 1.1.2 The Type `Int`
The `Int` data type can store whole numbers. They are arbitrary-precision, which means their range is unlimited (excluding the computer's memory). Owlet provides a number of operators that act on integral values:
* The comparison operators `<`, `<=`, `>`, `>=`, and `=`, which result in a value of type `Trit`:
    * The value produced by the `>` operator is `true` if the value of the left-hand operand is less than the value of the right-hand operand, and otherwise is `false`. 
    * The value produced by the `<=` operator is `true` if the value of the left-hand operand is less than or equal to the value of the right-hand operand, and otherwise is `false`.
    *  The value produced by the `>` operator is `true` if the value of the left-hand operand is greater than the value of the right-hand operand, and otherwise is `false`.
    * The value produced by the `>` operator is `true` if the value of the left-hand operand is greater than or equal to the value of the right-hand operand, and otherwise is `false`.
    * The value produced by the `=` operator is `true` if the value of the left-hand operand is equal to the value of the right-hand operand, and otherwise is `false`.
* The numerical operators, which result in a value of type `Int`:
    * The addition operator `+`, which outputs the sum of the operands.
    * The subtraction operator `-`, which outputs the difference of the operands.
    * The unary minus, or tritwise NOT `-`, which outputs the negation of the operand. Unlike the subtraction, it takes only 1 argument.
    * The multiplication operator `*`, which outputs the product of the operands.
    * The division operator `/`, which outputs the quotient of the operands. This excludes the remainder completely.
    * The tritwise AND `&`, which performs the `&&` operator on each trit in the balanced ternary representations of the operands.
    * The tritwise OR `|`, which performs the `||` operator  on each trit in the balanced ternary representations of the operands.
    * The tritwise XOR `^`, which performs the `^^` operator on each trit in the balanced ternary representations of the operands.

Here is an example:
```clojure
(+ 7 (* 2 3)) //=> 13
```

The built-in integer operators do not indicate overflow or underflow in any way.

## 1.1.3 The Type `Float`
The `Float` data type can store fractional numbers and uses a [logarithmic number system](https://en.wikipedia.org/wiki/Logarithmic_number_system) internally. Due to their internal representation, there may be massive rounding errors on the order of thousandths when floats are converted from decimal to balanced ternary. This issue is planned to be patched soon. Floats are arbitrary-precision, which means their range and precision is unlimited (excluding the computer's memory and the previously-mentioned roundoff errors). Owlet provides a number of operators that act on integral values:
* The comparison operators `<`, `<=`, `>`, `>=`, and `=`, which result in a value of type `Trit`:
    * The value produced by the `>` operator is `true` if the value of the left-hand operand is less than the value of the right-hand operand, and otherwise is `false`. 
    * The value produced by the `<=` operator is `true` if the value of the left-hand operand is less than or equal to the value of the right-hand operand, and otherwise is `false`.
    *  The value produced by the `>` operator is `true` if the value of the left-hand operand is greater than the value of the right-hand operand, and otherwise is `false`.
    * The value produced by the `>` operator is `true` if the value of the left-hand operand is greater than or equal to the value of the right-hand operand, and otherwise is `false`.
    * The value produced by the `=` operator is `true` if the value of the left-hand operand is equal to the value of the right-hand operand, and otherwise is `false`.
* The numerical operators, which result in a value of type `Float`:
    * The addition operator `+`, which outputs the sum of the operands. This operator is **incredibly slow** because adding logarithmic fixed-point numbers requires computing a Gaussian logarithm.
    * The subtraction operator `-`, which outputs the difference of the operands. This operator is **incredibly slow** because subtracting logarithmic fixed-point numbers requires computing a Gaussian logarithm.
    * The unary minus `-`, which outputs the negation of the operand. Unlike the subtraction, it takes only 1 argument.
    * The multiplication operator `*`, which outputs the product of the operands.
    * The division operator `/`, which outputs the division of the operands.

Here is an example:
```clojure
(* 1.5 2.0) //=> 2.999944185232493
```
