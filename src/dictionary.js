import * as nullType from "./null.js"
import * as quit from "./quit.js"
/**
 * This module defines a dictionary (hash table).
 * Credits to Jerry Ejonavi for making part of the code.
 */

function _Dictionary() {
    this.hashes = {};
}


_Dictionary.prototype = {
    constructor: _Dictionary,
    
    //Setts a key-value pair
    set: function( key, value ) {
        this.hashes[ JSON.stringify( key ) ] = value;
    },

    //Gets a value from keys
    get: function( key ) {
        var result = this.hashes[ JSON.stringify( key ) ];
        if(result === undefined) {
            result = new nullType._Null();
        }
        return result;
    }
};

_Dictionary.prototype.toString = function() {
  return JSON.stringify(this.hashes);
}




export { _Dictionary }