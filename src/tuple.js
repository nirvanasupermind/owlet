const nullType = require('./null.js')
function _Tuple(...args) {
    args.forEach((val, idx) =>
        Object.defineProperty(this, "item" + idx, { get: () => val })
    )
}

_Tuple.prototype.set = function (val, idx) {
    Object.defineProperty(this, "item" + idx, { get: () => val })
}

_Tuple.prototype.get = function (idx) {
    return (this["item" + idx] === undefined ? new nullType._Null() : this["item" + idx]);
}

_Tuple.prototype.length = function () {
    var result = 0;
    while (!(this.get(result) instanceof nullType._Null)) {
        result++;
    }

    return result;
}

_Tuple.prototype.toArray = function() {
    var idx = 0;
    var result = [];
     while (!(this.get(idx) instanceof nullType._Null)) {
        result.push(this.get(idx));
        idx++;
    }

    return result;
}

_Tuple.prototype.toString = function() {
    return "<"+(this.toArray().map((e) => e._toString()).join(","))+">";
}

_Tuple.prototype.toJSON = function() {
    return this.toString();
}
module.exports = { _Tuple };