/*
 * tests/compat.js: Some of the APIs provided by vasync are intended to be
 * API-compatible with node-async, so we incorporate the tests from node-async
 * directly here.  These are copied from https://github.com/caolan/async,
 * available under the MIT license.  To make it easy to update this from the
 * source, this file should remain unchanged from the source except for this
 * header comment, the change to the "require" line, and deleted lines for
 * unimplemented functions.
 *
 * The following tests are deliberately omitted:
 *
 * o "waterfall non-array": Per Joyent's Best Practices for Node.js Error
 *   Handling, we're strict about argument types and throw on these programmer
 *   errors rather than emitting them asynchronously.
 *
 * o "waterfall multiple callback calls": We deliberately disallow a waterfall
 *   function to invoke its callback more than once, so we don't test for that
 *   here.  The behavior that node-async allows can potentially be used to fork
 *   the waterfall, which may be useful, but it's often used instead as an
 *   excuse to write code sloppily.  And the downside is that it makes it really
 *   hard to understand bugs where the waterfall was resumed too early.  For
 *   now, we're disallowing it, but if the forking behavior becomes useful, we
 *   can always make our version less strict.
 */
var async = require('../lib/vasync');

exports['waterfall'] = function(test){
    test.expect(6);
    var call_order = [];
    async.waterfall([
        function(callback){
            call_order.push('fn1');
            setTimeout(function(){callback(null, 'one', 'two');}, 0);
        },
        function(arg1, arg2, callback){
            call_order.push('fn2');
            test.equals(arg1, 'one');
            test.equals(arg2, 'two');
            setTimeout(function(){callback(null, arg1, arg2, 'three');}, 25);
        },
        function(arg1, arg2, arg3, callback){
            call_order.push('fn3');
            test.equals(arg1, 'one');
            test.equals(arg2, 'two');
            test.equals(arg3, 'three');
            callback(null, 'four');
        },
        function(arg4, callback){
            call_order.push('fn4');
            test.same(call_order, ['fn1','fn2','fn3','fn4']);
            callback(null, 'test');
        }
    ], function(err){
        test.done();
    });
};

exports['waterfall empty array'] = function(test){
    async.waterfall([], function(err){
        test.done();
    });
};

exports['waterfall no callback'] = function(test){
    async.waterfall([
        function(callback){callback();},
        function(callback){callback(); test.done();}
    ]);
};

exports['waterfall async'] = function(test){
    var call_order = [];
    async.waterfall([
        function(callback){
            call_order.push(1);
            callback();
            call_order.push(2);
        },
        function(callback){
            call_order.push(3);
            callback();
        },
        function(){
            test.same(call_order, [1,2,3]);
            test.done();
        }
    ]);
};

exports['waterfall error'] = function(test){
    test.expect(1);
    async.waterfall([
        function(callback){
            callback('error');
        },
        function(callback){
            test.ok(false, 'next function should not be called');
            callback();
        }
    ], function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};
