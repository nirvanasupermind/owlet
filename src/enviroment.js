const modules = require("./modules.js")
/**
 * Enviroment: names storage.
 */
class Enviroment {
    /**
     * Creates an enviroment with the given record.
     */
    constructor(record = {}) {
        this.record = record;
    }

    /**
     * Creates a variable with the given name and value.
     */

    define(name, value) {
        this.record[name] = value;
        return value;
    }

    lookup(name) {
        if (!this.record.hasOwnProperty(name)) {
            throw new ReferenceError(`Variable ${name} is not defined.`)
        }

        return this.record[name];
    }



}

Enviroment.builtins = new Enviroment({
    null: new modules.nullType._Null(),
    true: new modules.trit._Trit("1"),
    unknown: new modules.trit._Trit("0"),
    false: new modules.trit._Trit("N"),
    VERSION: new modules.string._String("0.1")
});

module.exports = Enviroment;