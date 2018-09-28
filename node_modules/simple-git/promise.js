'use strict';

if (typeof Promise === 'undefined') {
   throw new ReferenceError("Promise wrappers must be enabled to use the promise API");
}

function asyncWrapper (fn, git, chain) {
   return function () {
      var args = [].slice.call(arguments);

      if (typeof args[args.length] === 'function') {
         throw new TypeError(
            "Promise interface requires that handlers are not supplied inline, " +
            "trailing function not allowed in call to " + fn);
      }

      return chain.then(function () {
         return new Promise(function (resolve, reject) {
            args.push(function (err, result) {
               if (err) {
                  reject(new Error(err));
               }
               else {
                  resolve(result);
               }
            });

            git[fn].apply(git, args);
         });
      });
   };
}

function syncWrapper (fn, git, api) {
   return function () {
      git[fn].apply(git, arguments);

      return api;
   };
}

function isAsyncCall (fn) {
   return /^[^\)]+then\s*\)/.test(fn) || /\._run\(/.test(fn);
}

module.exports = function (baseDir) {

   var git;
   var chain = Promise.resolve();

   try {
      git = require('./src')(baseDir);
   }
   catch (e) {
      chain = Promise.reject(e);
   }

   return Object.keys(git.constructor.prototype).reduce(function (api, fn) {
      if (/^_|then/.test(fn)) {
         return api;
      }

      if (isAsyncCall(git[fn])) {
         api[fn] = asyncWrapper(fn, git, chain);
      }

      else {
         api[fn] = syncWrapper(fn, git, api);
      }

      return api;

   }, {});

};
