/**
 * This file collects all the type modules into one, 
 * removing the need to import each of them seperately.
 */

const BigInteger = require("big-integer");
const trit = require("./trit.js");
const int = require("./int.js");
const float = require("./float.js");
const table = require("./table.js");
const string = require("./string.js");
const nullType = require("./null.js");
const quit = require("./quit.js");



module.exports = { BigInteger, trit, int, float, table, string, nullType }
