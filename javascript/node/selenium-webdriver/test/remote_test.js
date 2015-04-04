// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

var assert = require('assert');

var promise = require('../').promise;
var remote = require('../remote');

describe('DriverService', function() {
  describe('start()', function() {
    var service;

    beforeEach(function() {
      service = new remote.DriverService(process.execPath, {
        port: 1234,
        args: ['-e', 'process.exit(1)']
      });
    });

    afterEach(function(done) {
      service.kill().thenFinally(function() {
        done();
      });
    });

    it('fails if child-process dies', function(done) {
      this.timeout(1000);
      service.start(500)
      .then(expectFailure.bind(null, done), verifyFailure.bind(null, done));
    });

    it('failures propagate through control flow if child-process dies',
      function(done) {
        this.timeout(1000);

        promise.controlFlow().execute(function() {
          promise.controlFlow().execute(function() {
            return service.start(500);
          });
        })
        .then(expectFailure.bind(null, done), verifyFailure.bind(null, done));
      });

    function verifyFailure(done, e) {
      try {
        assert.ok(!(e instanceof promise.CancellationError));
        assert.equal('Server terminated early with status 1', e.message);
        done();
      } catch (ex) {
        done(ex);
      }
    }

    function expectFailure(done) {
      done(Error('expected to fail'));
    }
  });
});
