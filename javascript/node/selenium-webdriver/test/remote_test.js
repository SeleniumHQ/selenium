// Copyright 2015 Software Freedom Conservancy
// Copyright 2015 Selenium committers
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var assert = require('assert');

var promise = require('../').promise;
var remote = require('../remote');

describe('DriverService', function() {

  describe('start() fails if child-process dies', function() {
    var service = new remote.DriverService(process.execPath, {
      port: 1234,
      args: ['-e', 'process.exit(1)']
    })

    after(function(done) {
      service.kill().thenFinally(function() {
        done();
      });
    });

    it('', function(done) {
      this.timeout(1000);
      service.start(500).then(function() {
        done(Error('expected to fail'));
      }, function(e) {
        try {
          assert.equal('Server terminated early with status 1', e.message);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
