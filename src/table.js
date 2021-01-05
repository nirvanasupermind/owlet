const nullType = require("./null.js");
const quit = require("./quit.js");
/**
 * This module defines a dictionary (hash table).
 * Credits to Jerry Ejonavi for making part of the code.
 */

function _Table() {
    this.hashes = {};
}


_Table.prototype = {
    constructor: _Table,
    
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

_Table.prototype.toString = function() {
  return JSON.stringify(this.hashes);
}




Object.assign(exports,{_Table})