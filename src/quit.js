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
function quit(msg) {
    if (msg) {
        throw new OwletError(msg);
    } else {
        throw new OwletError();
    }
}

//Assertion

function assert(cond) {
    if(!cond) {
        throw new OwletError("AssertionError");
    }
}



export { quit, assert};