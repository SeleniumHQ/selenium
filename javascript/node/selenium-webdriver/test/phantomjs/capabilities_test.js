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


const fs = require('fs');
const sinon = require('sinon');
const test = require('../../lib/test');

const sandbox = sinon.sandbox.create();

const webdriver = require('../..'),
    assert = require('../../testing/assert'),
    remote = require('../../remote/');



test.suite(function(env) {

  test.afterEach(function(){
    sandbox.restore();
  });

  describe("capabilities.set('acceptSslCerts', true)", function() {
    test.it('sends --ignore-ssl-errors=true into the DriverService',
       function() {
        var _start = remote.DriverService.prototype.start;
        sandbox.stub(
          remote.DriverService.prototype,
          'start',
          function(options){
            that = this;
            return that.args_
            .then( args => {
              assert(args).contains('--ignore-ssl-errors=true');
              return _start.bind(that).call(options);
            });
          }
        );

         var capabilities = webdriver.Capabilities.phantomjs();
         capabilities.set('acceptSslCerts', true);

         return new webdriver.Builder()
         .withCapabilities(capabilities)
         .build();
      });
   });

}, {browsers: ['phantomjs']});

