/**
Defines an error function
*/



class OwletWarning {
    constructor(message) {
        this.message = message;
    }

    raise() {
        console.warn("OwletWarning: " + this.message.toString().split(": ").slice(1));
    }
}

function quit(msg) {
    var err = new Error(msg);
    throw err;
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



module.exports = { quit, warn, OwletWarning };