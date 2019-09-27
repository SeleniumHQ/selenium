// Copyright 2012 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview An adaptor from a Result to a Deferred.
 *
 * TODO (vbhasin): cancel() support.
 * TODO (vbhasin): See if we can make this a static.
 * TODO (gboyer, vbhasin): Rename to "Adapter" once this graduates; this is the
 * proper programmer spelling.
 */


goog.provide('goog.result.DeferredAdaptor');

goog.require('goog.async.Deferred');
goog.require('goog.result');
goog.require('goog.result.Result');



/**
 * An adaptor from Result to a Deferred, for use with existing Deferred chains.
 *
 * @param {!goog.result.Result} result A result.
 * @constructor
 * @extends {goog.async.Deferred}
 * @final
 * @deprecated Use {@link goog.Promise} instead - http://go/promisemigration
 */
goog.result.DeferredAdaptor = function(result) {
  goog.result.DeferredAdaptor.base(this, 'constructor');
  goog.result.wait(result, function(result) {
    if (this.hasFired()) {
      return;
    }
    if (result.getState() == goog.result.Result.State.SUCCESS) {
      this.callback(result.getValue());
    } else if (result.getState() == goog.result.Result.State.ERROR) {
      if (result.getError() instanceof goog.result.Result.CancelError) {
        this.cancel();
      } else {
        this.errback(result.getError());
      }
    }
  }, this);
};
goog.inherits(goog.result.DeferredAdaptor, goog.async.Deferred);
