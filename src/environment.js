const modules = require("./modules.js")
/**
 * Environment: names storage.
 */
class Environment {
    /**
     * Creates an Environment with the given record.
     */
    constructor(record = {}, parent = null) {
        this.record = record;
        this.parent = parent;
    }

    /**
     * Creates a variable with the given name and value.
     */

    define(name, value) {
        this.record[name] = value;
        return value;
    }

    lookup(name) {
        var orig = this.resolve(name).record[name];
        return orig;
    }

    /**
     * Updates an existing variable
     * @param {*} name 
     * @param {*} value 
     */
    assign(name, value) {
        this.resolve(name).record[name] = value;
        return value;
    }

    /**
     * Returns specific Environment in which a variable is defined
     * @param {string} name 
     */
    resolve(name) {
        if (this.record.hasOwnProperty(name)) {
            return this;
        }

        if (this.parent == null) {
            modules.quit.quit(`Variable ${JSON.stringify(name)} is not defined.`);
        }

        return this.parent.resolve(name)
    }





}



module.exports = Environment;