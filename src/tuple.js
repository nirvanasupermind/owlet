const nullType = require('./null.js')
const int = require('./int.js')
function _Tuple(...args) {
    args.forEach((val, idx) =>
        Object.defineProperty(this, "item" + idx, { get: () => val })
    )
}

_Tuple.prototype.get = function (idx) {
    if(idx instanceof int._Int) {
        if(idx.value.charAt(0) === "N") {
            idx = this.length().sub(idx.neg());
        }
    }
    return (this["item" + idx] === undefined ? new nullType._Null() : this["item" + idx]);
}

_Tuple.prototype.length = function () {
    var result = 0;
    while (!(this.get(result) instanceof nullType._Null)) {
        result++;
    }

    return new int._Int(result);
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
    return "<"+(this.toArray().map((e) => JSON.stringify(e)).join(","))+">";
}

_Tuple.prototype.toJSON = function() {
    return this.toString();
}
module.exports = { _Tuple };