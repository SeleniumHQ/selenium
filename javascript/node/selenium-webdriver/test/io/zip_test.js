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
const fs = require('fs')
const path = require('path')

const io = require('../../io')
const zip = require('../../io/zip')
const { InvalidArgumentError } = require('../../lib/error')
const { locate } = require('../../lib/test/resources')

const XPI_PATH = locate('common/extensions/webextensions-selenium-example.xpi')

describe('io/zip', function () {
  describe('unzip', function () {
    it('creates destination dir if necessary', function () {
      return io
        .tmpDir()
        .then((dir) => zip.unzip(XPI_PATH, dir))
        .then((dir) => {
          assertExists(path.join(dir, 'inject.js'))
          assertExists(path.join(dir, 'manifest.json'))
          assertExists(path.join(dir, 'META-INF/manifest.mf'))
        })
    })
  })

  describe('Zip', function () {
    let dir

    beforeEach(function () {
      return io.tmpDir().then((d) => (dir = d))
    })

    it('can convert an archive to a buffer', function () {
      let z = new zip.Zip()
      return io
        .mkdirp(path.join(dir, 'a/b/c/d/e'))
        .then(() => {
          return Promise.all([
            io.write(path.join(dir, 'foo'), 'a file'),
            io.write(path.join(dir, 'a/b/c/carrot'), 'an orange carrot'),
            io.write(path.join(dir, 'a/b/c/d/e/elephant'), 'e is for elephant'),
          ])
        })
        .then(() => z.addDir(dir))
        .then(() => Promise.all([io.tmpDir(), z.toBuffer()]))
        .then(([outDir, buf]) => {
          let output = path.join(outDir, 'out.zip')
          return io
            .write(output, buf)
            .then(() => io.tmpDir())
            .then((d) => zip.unzip(output, d))
            .then((d) => {
              assertContents(path.join(d, 'foo'), 'a file')
              assertContents(path.join(d, 'a/b/c/carrot'), 'an orange carrot')
              assertContents(
                path.join(d, 'a/b/c/d/e/elephant'),
                'e is for elephant'
              )
            })
        })
    })

    describe('getFile', function () {
      it('returns archive file contents as a buffer', function () {
        let foo = path.join(dir, 'foo')
        fs.writeFileSync(foo, 'hello, world!')

        let z = new zip.Zip()
        return z
          .addFile(foo)
          .then(() => {
            assert.ok(z.has('foo'))
            return z.getFile('foo')
          })
          .then((buffer) =>
            assert.strictEqual(buffer.toString('utf8'), 'hello, world!')
          )
      })

      it('returns an error if file is not in archive', function () {
        let z = new zip.Zip()
        assert.ok(!z.has('some-file'))
        return z.getFile('some-file').then(
          () => assert.fail('should have failed'),
          (e) => assert.strictEqual(e.constructor, InvalidArgumentError)
        )
      })

      it('returns a rejected promise if the requested path is a directory', function () {
        let file = path.join(dir, 'aFile')
        fs.writeFileSync(file, 'hello, world!')

        let z = new zip.Zip()
        return z
          .addDir(dir, 'foo')
          .then(() => z.getFile('foo'))
          .then(
            () => assert.fail('should have failed'),
            (e) => assert.strictEqual(e.constructor, InvalidArgumentError)
          )
          .then(() => z.getFile('foo/aFile'))
          .then((b) => assert.strictEqual(b.toString('utf8'), 'hello, world!'))
      })
    })
  })

  function assertExists(p) {
    assert.ok(fs.existsSync(p), `expected ${p} to exist`)
  }

  function assertContents(p, c) {
    assert.strictEqual(
      fs.readFileSync(p, 'utf8'),
      c,
      `unexpected file contents for ${p}`
    )
  }
})
