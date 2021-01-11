/**
Defines an error function
*/

class OwletError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = "OwletError"
    }
}


class OwletWarning {
    constructor(message) {
        this.message = message;
    }

    raise() {
        console.warn("OwletWarning: " + this.message.toString().split(": ").slice(1));
    }
}
function quit(msg) {
    if (msg) {
        throw new OwletError(msg);
    } else {
        throw new OwletError();
    }
}

function warn(msg) {
    new OwletWarning(msg).raise();
}

// //Assertion

// function assert(cond) {
//     if(!cond) {
//         throw new OwletError("AssertionError");
//     }
// }



module.exports = { quit, warn, OwletError, OwletWarning };