'use strict';

module.exports = audit;

/**
 * Audits the req/res for the client. The audit will use bunyan's
 * formatters. See bunyan-format for the user-friendly output.
 *
 * @param  {Object} err   The http error object.
 * @param  {Object} req   The http request object.
 * @param  {Object} res   The http response object.
 *
 * @returns {undefined} Does not return anything.
 */
function audit(err, req, res) {
    req.headers = req._headers;
    req.url = req.path;
    var log = req.log;

    var obj = {
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort,
        req: req,
        res: res,
        err: err,
        secure: req.secure
    };

    log.info(obj);
}
