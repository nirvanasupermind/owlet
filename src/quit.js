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


class Warning {
    constructor(message) {
        this.message = message;
    }

    raise() {
      console.warn(this.message.toString().replace(/Error/g,"Warning"))
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
    new Warning(msg).raise();
}

// //Assertion

// function assert(cond) {
//     if(!cond) {
//         throw new OwletError("AssertionError");
//     }
// }



module.exports = { quit, warn, OwletError, Warning };