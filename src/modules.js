/**
 * This file collects all the type modules into one, 
 * removing the need to import each of them seperately.
 */
import * as trit from "./trit.js"
import * as int from "./int.js"
import * as float from "./float.js"
import * as dictionary from "./dictionary.js"
import * as string from "./string.js"
import * as nullType from "./null.js"
import * as quit from "./quit.js"


BigInt.prototype.toJSON = function() {
    return this.toString(10);
}
export { trit, int, float, dictionary, string, nullType, quit}