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

# 1 Types, Values, and Variables
Owlet is a weakly-typed language, which means that variables are not bound to a specific data type. 

## 1.1 Supported Types
Owlet v0.1 supports the following types:
```
    Trit
    Int
    Float
    Func<T0, T1, ..., TN, R>
```

In v0.1 new types can't be added.

### 1.1.1 The Type `Trit`
The `Trit` type is a three-valued enumeration in which there are three truth values indicating `true`, `false` and some indeterminate third value (labeled as `unknown` in Owlet). They can also represent balanced ternary digits. Owlet's implementation of trit is based on [Kleene logic](https://en.wikipedia.org/wiki/Three-valued_logic#Kleene_and_Priest_logics), so the unknown value is falsey. The logical operations `&&`, `||` and `^^` can be perfomed on trits:
```clojure
(print (&& unknown true)) //=> unknown
```

They are also based on Kleene logic.

### 1.1.2 The Type `Int`
The `Int` type represents 