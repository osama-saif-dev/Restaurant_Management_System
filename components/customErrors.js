class CustomError extends Error {
    constructor (message, code = null, errors = {}){
        super(message);
        this.code = code;
        this.errors = errors;
    }
}

export default CustomError;