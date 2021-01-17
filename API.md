# Table of Contents
1. [0 Lexical Structure](#0-lexical-structure)
    1. [0.1 Comments](#01-comments)
    1. [0.2 atoms](#02-atoms)
1. [1 Types, Values, and Variables](#1-types-values-and-variables)
    1. [1.1 Supported Types](#11-supported-types)
# 0 Lexical Structure
This chapter specifies the lexical structure of Owlet. Owlet programs are written using the ASCII character set. 
## 0.1 Comments
A comment is text that the compiler ignores but that is useful for programmers. Comments are normally used to embed annotations in the code. The interpreter treats them as white space. Owlet defines two kinds of comments:
1. `/* text */ `<br />A traditional comment: all the text from the ASCII characters /* to the ASCII characters */ is ignored (as in C and C++).
2. `// text`<br />A single-line comment: all the text from the ASCII characters // to the end of the line is ignored (as in C++).

## 0.2 atoms
An **atom** is the source code representation of a value of a type or the null. There are two types of atoms, atoms and lists. Atoms can be further split into these categories:
* Integers, which can be expressed in decimal or balanced ternary numeral systems. A decimal integer is a sequence of digits that are one of `0123456789`. A balanced ternary integer is preceeded by a suffix `0z`, and is a sequence of digits that are one of `01N`.
* Strings, which are a hash table of ASCII characters combined to produce a run of text. They are circumfixed by the character `"` "quote".

## 0.3 Syntax
Owlet uses Lisp-style S-expressions in it's syntax. This means that all expressions are either an [atom](#02-atoms) such as `foo`, or a list of atoms seperated by whitespace such as `(foo 5)`. It is reccomended to put all your code inside a begin statement (*see* Blocks), like this:
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

