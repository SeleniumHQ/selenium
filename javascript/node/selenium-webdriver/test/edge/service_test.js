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

'use strict'

const assert = require('assert')
const edge = require('../../edge')
const test = require('../../lib/test')

test.suite(
  function (_env) {
    describe('msedgedriver', function () {
      let service

      afterEach(function () {
        if (service) {
          return service.kill()
        }
      })

      it('can start msedgedriver', async function () {
        service = new edge.ServiceBuilder().build()

        let url = await service.start()
        assert(/127\.0\.0\.1/.test(url), `unexpected url: ${url}`)
      })
    })
  },
  { browsers: ['MicrosoftEdge'] }
)
