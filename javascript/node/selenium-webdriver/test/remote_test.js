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
const path = require('path')
const io = require('../io')
const cmd = require('../lib/command')
const remote = require('../remote')
const { CancellationError } = require('../http/util')

describe('DriverService', function () {
  describe('start()', function () {
    var service

    beforeEach(function () {
      service = new remote.DriverService(process.execPath, {
        port: 1234,
        args: ['-e', 'process.exit(1)'],
      })
    })

    afterEach(function () {
      return service.kill()
    })

    it('fails if child-process dies', function () {
      return service.start(500).then(expectFailure, verifyFailure)
    })

    function verifyFailure(e) {
      assert.ok(!(e instanceof CancellationError))
      assert.strictEqual('Server terminated early with status 1', e.message)
    }

    function expectFailure() {
      throw Error('expected to fail')
    }
  })
})

describe('FileDetector', function () {
  class ExplodingDriver {
    execute() {
      throw Error('unexpected call')
    }
  }

  it('returns the original path if the file does not exist', function () {
    return io.tmpDir().then((dir) => {
      let theFile = path.join(dir, 'not-there')
      return new remote.FileDetector()
        .handleFile(new ExplodingDriver(), theFile)
        .then((f) => assert.strictEqual(f, theFile))
    })
  })

  it('returns the original path if it is a directory', function () {
    return io.tmpDir().then((dir) => {
      return new remote.FileDetector()
        .handleFile(new ExplodingDriver(), dir)
        .then((f) => assert.strictEqual(f, dir))
    })
  })

  it('attempts to upload valid files', function () {
    return io.tmpFile().then((theFile) => {
      return new remote.FileDetector()
        .handleFile(
          new (class FakeDriver {
            execute(command) {
              assert.strictEqual(command.getName(), cmd.Name.UPLOAD_FILE)
              assert.strictEqual(
                typeof command.getParameters()['file'],
                'string'
              )
              return Promise.resolve('success!')
            }
          })(),
          theFile
        )
        .then((f) => assert.strictEqual(f, 'success!'))
    })
  })
})
