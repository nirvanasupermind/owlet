//Null type
function _Null() {}
_Null.prototype.toString = function() { 
    return "null";
}

_Null.prototype.toJSON = function() {
    return null;
}

module.exports = { _Null }