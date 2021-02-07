  var _Enum = (function(foo) {

    var EnumItem = function(item){
        if(typeof item == "string"){
            this.name = item;
        } else {
            this.name = item.name;
        }
    }
    
    EnumItem.prototype = new String("DEFAULT");
    EnumItem.prototype.toString = function(){
        return this.name;
    }
    
    
    EnumItem.prototype.equals = function(item){
        if(typeof item == "string"){
            return this.name == item;
        } else {
            return this == item && this.name == item.name;
        }
    }

    function Enum() {
        this.add.apply(this, arguments);
        delete this[""]
        Object.freeze(this);
    }
    Enum.prototype.add = function() {
        for (var i in arguments) {
            var enumItem = new EnumItem(arguments[i]);
            this[enumItem.name] = enumItem;
        }
    };
    Enum.prototype.toList = function() {
        return Object.keys(this);
    };

    Enum.prototype.toString = function() {
        return "[Enum]";
    }
    foo.Enum = Enum;
    return Enum;
})(this);

module.exports = { _Enum };