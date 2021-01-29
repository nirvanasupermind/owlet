const nullType = require("./null.js");
const quit = require("./quit.js");
const util = require("util");
const MAX_PROPS = 6;
const ABSOLUTE_MAX_PROPS = 50;

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
  set: function (key, value) {
    this.hashes[JSON.stringify(key)] = value;
    return value;
  },

  //Gets a value from keys
  get: function (key) {
    var result = this.hashes[JSON.stringify(key)];
    if (result === undefined) {
      result = new nullType._Null();
    }
    return result;
  }
};

var getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (String(value) === "[object Object]") {
      if ((value.hasOwnProperty("params") && value.hasOwnProperty("body")) || value.hasOwnProperty("record")) {
        return value._toString();
      }
    }

    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  };
};

JSON.stringify2 = function (o) {
  if (Object.getOwnPropertyNames(o).length >= MAX_PROPS) {
    return JSON.stringify(o,getCircularReplacer(),4);
    // var o2 = o.clone();
    // var o3 = o.clone();
    // var props = Object.getOwnPropertyNames(o);
    // for(var i = Math.floor(MAX_PROPS/3); i < props.length; i++) {
    //   delete o2[props[i]];
    // }

    // for(var i = 0; i < Math.floor(2*MAX_PROPS/3); i++) {
    //   delete o3[props[i]];
    // }

    // return JSON.stringify(o2,getCircularReplacer(),4).slice(0,-2)+",\n    ..."+JSON.stringify(o3,getCircularReplacer(),4).slice(1);
  } else {
    return JSON.stringify(o, getCircularReplacer());
  }
}

_Table.prototype.toString = function () {
  return JSON.stringify2(this);
}

_Table.prototype.toJSON = function () {
  return this.hashes;
}

_Table.from = function (o) {
  if (o instanceof _Table) {
    return o;
  } else {
    var result = new _Table();
    for (var i = 0; i < Object.keys(o).length; i++) {
      result.set(Object.keys(o)[i], o[Object.keys(o)[i]]);
    }

    return result;
  }
}






module.exports = { _Table, getCircularReplacer }