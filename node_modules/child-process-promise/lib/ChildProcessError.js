'use strict';


class ChildProcessError extends Error {
    constructor(message, code, childProcess, stdout, stderr) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.childProcess = childProcess;
        this.stdout = stdout;
        this.stderr = stderr;
    }
}



module.exports = ChildProcessError;