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


//builtins
Environment.builtins = {
    null: new modules.nullType._Null(),
    true: new modules.trit._Trit("1"),
    unknown: new modules.trit._Trit("0"),
    false: new modules.trit._Trit("N"),
    VERSION: new modules.string._String("0.2"),
    PI: new modules.float._Float(Math.PI),
    E: new modules.float._Float(Math.E),
    PHI: new modules.float._Float((1 + Math.sqrt(5)) / 2),
    '+'(op1, op2) {
        return op1.add(op2);
    },
    '-'(op1, op2 = null) {
        if (op2 == null)
            return op1.neg();
        return op1.sub(op2);
    },
    '*'(op1, op2) {
        return op1.mul(op2);
    },
    '/'(op1, op2) {
        return op1.div(op2);
    },
    '%'(op1,op2) {
        return op1.mod(op2);
    },
    '>'(op1, op2) {
        return new modules.trit._Trit(op1.compareTo(op2) > 0);
    },
    '>='(op1, op2) {
        return new modules.trit._Trit(op1.compareTo(op2) >= 0);
    },
    '<'(op1, op2) {
        return new modules.trit._Trit(op1.compareTo(op2) < 0);
    },
    '<='(op1, op2) {
        return new modules.trit._Trit(op1.compareTo(op2) <= 0);
    },
    '='(op1, op2) {
        return new modules.trit._Trit(JSON.stringify(op1) == JSON.stringify(op2));
    },
    '&'(op1, op2) {
        return new modules.int._Int(op1.and(op2));
    },
    "|"(op1, op2) {
        return new modules.int._Int(op1.or(op2))
    },
    "^"(op1, op2) {
        return new modules.int._Int(op1.xor(op2));
    },
    '!'(op1) {
        return op1.not();
    },
    '&&'(op1, op2) {
        return new modules.trit._Trit(op1.and(op2));
    },
    '||'(op1, op2) {
        return new modules.trit._Trit(op1.or(op2));
    },
    '^^'(op1, op2) {
        return new modules.trit._Trit(op1.xor(op2));
    },
    'print'(...args) {
        console.log(args.map((e) => e._toString()).join(" "));
        return new modules.nullType._Null();
    },
    'ord'(op1) {
        return new modules.int._Int(modules.int._Int.convertToBT(modules.int.ord(op1._toString())));
    },
    'read'(table, key) {
        // if (!(table instanceof modules.table._Table)) {
        //     return toTernary(table[key]);
        // }
        return table.get(key);
    },
    'write'(table, key, value) {
        // if (!(table instanceof modules.table._Table)) {
        //     return table[key] = value;
        // }
        return table.set(key, value);
    },
    'len'(table) {
        return Object.getOwnPropertyNames(table.hashes).length;
    },
    'keys'(table) {
        return toTernary(Object.getOwnPropertyNames(table.hashes).map((e) => JSON.parse(e)));
    },
    'values'(table) {
      return toTernary(Object.getOwnPropertyNames(table.hashes).map((e) => table.get(JSON.parse(e))));
    },
    'abs'(op1) {
        return op1.abs()
    }
};


Environment.builtins = new Environment(Environment.builtins);

module.exports = Environment;