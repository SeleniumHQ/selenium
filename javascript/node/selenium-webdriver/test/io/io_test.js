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

'use strict';

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    tmp = require('tmp');

var io = require('../../io');


describe('io', function() {
  describe('copy', function() {
    var tmpDir;

    before(function() {
      return io.tmpDir().then(function(d) {
        tmpDir = d;

        fs.writeFileSync(path.join(d, 'foo'), 'Hello, world');
      });
    });

    it('can copy one file to another', function() {
      return io.tmpFile().then(function(f) {
        return io.copy(path.join(tmpDir, 'foo'), f).then(function(p) {
          assert.equal(p, f);
          assert.equal('Hello, world', fs.readFileSync(p));
        });
      });
    });

    it('can copy symlink to destination', function() {
      if (process.platform === 'win32') {
        return;  // No symlinks on windows.
      }
      fs.symlinkSync(
          path.join(tmpDir, 'foo'),
          path.join(tmpDir, 'symlinked-foo'));
      return io.tmpFile().then(function(f) {
        return io.copy(path.join(tmpDir, 'symlinked-foo'), f).then(function(p) {
          assert.equal(p, f);
          assert.equal('Hello, world', fs.readFileSync(p));
        });
      });
    });

    it('fails if given a directory as a source', function() {
      return io.tmpFile().then(function(f) {
        return io.copy(tmpDir, f);
      }).then(function() {
        throw Error('Should have failed with a type error');
      }, function() {
        // Do nothing; expected.
      });
    });
  });

  describe('copyDir', function() {
    it('copies recursively', function() {
      return io.tmpDir().then(function(dir) {
        fs.writeFileSync(path.join(dir, 'file1'), 'hello');
        fs.mkdirSync(path.join(dir, 'sub'));
        fs.mkdirSync(path.join(dir, 'sub/folder'));
        fs.writeFileSync(path.join(dir, 'sub/folder/file2'), 'goodbye');

        return io.tmpDir().then(function(dst) {
          return io.copyDir(dir, dst).then(function(ret) {
            assert.equal(dst, ret);

            assert.equal('hello',
              fs.readFileSync(path.join(dst, 'file1')));
            assert.equal('goodbye',
              fs.readFileSync(path.join(dst, 'sub/folder/file2')));
          });
        });
      });
    });

    it('creates destination dir if necessary', function() {
      return io.tmpDir().then(function(srcDir) {
        fs.writeFileSync(path.join(srcDir, 'foo'), 'hi');
        return io.tmpDir().then(function(dstDir) {
          return io.copyDir(srcDir, path.join(dstDir, 'sub'));
        });
      }).then(function(p) {
        assert.equal('sub', path.basename(p));
        assert.equal('hi', fs.readFileSync(path.join(p, 'foo')));
      });
    });

    it('supports regex exclusion filter', function() {
      return io.tmpDir().then(function(src) {
        fs.writeFileSync(path.join(src, 'foo'), 'a');
        fs.writeFileSync(path.join(src, 'bar'), 'b');
        fs.writeFileSync(path.join(src, 'baz'), 'c');
        fs.mkdirSync(path.join(src, 'sub'));
        fs.writeFileSync(path.join(src, 'sub/quux'), 'd');
        fs.writeFileSync(path.join(src, 'sub/quot'), 'e');

        return io.tmpDir().then(function(dst) {
          return io.copyDir(src, dst, /(bar|quux)/);
        });
      }).then(function(dir) {
        assert.equal('a', fs.readFileSync(path.join(dir, 'foo')));
        assert.equal('c', fs.readFileSync(path.join(dir, 'baz')));
        assert.equal('e', fs.readFileSync(path.join(dir, 'sub/quot')));

        assert.ok(!fs.existsSync(path.join(dir, 'bar')));
        assert.ok(!fs.existsSync(path.join(dir, 'sub/quux')));
      });
    });

    it('supports exclusion filter function', function() {
      return io.tmpDir().then(function(src) {
        fs.writeFileSync(path.join(src, 'foo'), 'a');
        fs.writeFileSync(path.join(src, 'bar'), 'b');
        fs.writeFileSync(path.join(src, 'baz'), 'c');
        fs.mkdirSync(path.join(src, 'sub'));
        fs.writeFileSync(path.join(src, 'sub/quux'), 'd');
        fs.writeFileSync(path.join(src, 'sub/quot'), 'e');

        return io.tmpDir().then(function(dst) {
          return io.copyDir(src, dst, function(f) {
            return f !== path.join(src, 'foo')
                && f !== path.join(src, 'sub/quot');
          });
        });
      }).then(function(dir) {
        assert.equal('b', fs.readFileSync(path.join(dir, 'bar')));
        assert.equal('c', fs.readFileSync(path.join(dir, 'baz')));
        assert.equal('d', fs.readFileSync(path.join(dir, 'sub/quux')));

        assert.ok(!fs.existsSync(path.join(dir, 'foo')));
        assert.ok(!fs.existsSync(path.join(dir, 'sub/quot')));
      });
    });
  });

  describe('exists', function() {
    var dir;

    before(function() {
      return io.tmpDir().then(function(d) {
        dir = d;
      });
    });

    it('returns a rejected promise if input value is invalid', function() {
      return io.exists(undefined).then(
          () => assert.fail('should have failed'),
          e => assert.ok(e instanceof TypeError));
    });

    it('works for directories', function() {
      return io.exists(dir).then(assert.ok);
    });

    it('works for files', function() {
      var file = path.join(dir, 'foo');
      fs.writeFileSync(file, '');
      return io.exists(file).then(assert.ok);
    });

    it('does not return a rejected promise if file does not exist', function() {
      return io.exists(path.join(dir, 'not-there')).then(function(exists) {
        assert.ok(!exists);
      });
    });
  });

  describe('unlink', function() {
    var dir;

    before(function() {
      return io.tmpDir().then(function(d) {
        dir = d;
      });
    });

    it('silently succeeds if the path does not exist', function() {
      return io.unlink(path.join(dir, 'not-there'));
    });

    it('deletes files', function() {
      var file = path.join(dir, 'foo');
      fs.writeFileSync(file, '');
      return io.exists(file).then(assert.ok).then(function() {
        return io.unlink(file);
      }).then(function() {
        return io.exists(file);
      }).then(function(exists) {
        return assert.ok(!exists);
      });
    });
  });

  describe('rmDir', function() {
    it('succeeds if the designated directory does not exist', function() {
      return io.tmpDir().then(function(d) {
        return io.rmDir(path.join(d, 'i/do/not/exist'));
      });
    });

    it('deletes recursively', function() {
      return io.tmpDir().then(function(dir) {
        fs.writeFileSync(path.join(dir, 'file1'), 'hello');
        fs.mkdirSync(path.join(dir, 'sub'));
        fs.mkdirSync(path.join(dir, 'sub/folder'));
        fs.writeFileSync(path.join(dir, 'sub/folder/file2'), 'goodbye');

        return io.rmDir(dir).then(function() {
          assert.ok(!fs.existsSync(dir));
          assert.ok(!fs.existsSync(path.join(dir, 'sub/folder/file2')));
        });
      });
    });
  });

  describe('findInPath', function() {
    const savedPathEnv = process.env['PATH'];
    afterEach(() => process.env['PATH'] = savedPathEnv);

    const cwd = process.cwd;
    afterEach(() => process.cwd = cwd);

    let dirs;
    beforeEach(() => {
      return Promise.all([io.tmpDir(), io.tmpDir(), io.tmpDir()]).then(arr => {
        dirs = arr;
        process.env['PATH'] = arr.join(path.delimiter);
      });
    });

    it('returns null if file cannot be found', () => {
      assert.strictEqual(io.findInPath('foo.txt'), null);
    });

    it('can find file on path', () => {
      let filePath = path.join(dirs[1], 'foo.txt');
      fs.writeFileSync(filePath, 'hi');

      assert.strictEqual(io.findInPath('foo.txt'), filePath);
    });

    it('returns null if file is in a subdir of a directory on the path', () => {
      let subDir = path.join(dirs[2], 'sub');
      fs.mkdirSync(subDir);

      let filePath = path.join(subDir, 'foo.txt');
      fs.writeFileSync(filePath, 'hi');

      assert.strictEqual(io.findInPath('foo.txt'), null);
    });

    it('does not match on directories', () => {
      fs.mkdirSync(path.join(dirs[2], 'sub'));
      assert.strictEqual(io.findInPath('sub'), null);
    });

    it('will look in cwd first if requested', () => {
      return io.tmpDir().then(fakeCwd => {
        process.cwd = () => fakeCwd;

        let theFile = path.join(fakeCwd, 'foo.txt');

        fs.writeFileSync(path.join(dirs[1], 'foo.txt'), 'hi');
        fs.writeFileSync(theFile, 'bye');

        assert.strictEqual(io.findInPath('foo.txt', true), theFile);
      });
    });
  });

  describe('read', function() {
    var tmpDir;

    before(function() {
      return io.tmpDir().then(function(d) {
        tmpDir = d;

        fs.writeFileSync(path.join(d, 'foo'), 'Hello, world');
      });
    });

    it('can read a file', function() {
      return io.read(path.join(tmpDir, 'foo')).then(buff => {
        assert.ok(buff instanceof Buffer);
        assert.equal('Hello, world', buff.toString());
      });
    });

    it('catches errors from invalid input', function() {
      return io.read({})
          .then(() => assert.fail('should have failed'),
                (e) => assert.ok(e instanceof TypeError));
    });

    it('rejects returned promise if file does not exist', function() {
      return io.read(path.join(tmpDir, 'not-there'))
          .then(() => assert.fail('should have failed'),
                (e) => assert.equal('ENOENT', e.code));
    });
  });

  describe('mkdirp', function() {
    it('recursively creates entire directory path', function() {
      return io.tmpDir().then(root => {
        let dst = path.join(root, 'foo/bar/baz');
        return io.mkdirp(dst).then(d => {
          assert.strictEqual(d, dst);
          return io.stat(d).then(stats => {
            assert.ok(stats.isDirectory());
          });
        });
      });
    });

    it('does nothing if the directory already exists', function() {
      return io.tmpDir()
          .then(dir => io.mkdirp(dir).then(d => assert.strictEqual(d, dir)));
    });
  });

  describe('walkDir', function() {
    it('walk directory', function() {
      return io.tmpDir().then(dir => {
        fs.writeFileSync(path.join(dir, 'file1'), 'hello');
        fs.mkdirSync(path.join(dir, 'sub'));
        fs.mkdirSync(path.join(dir, 'sub/folder'));
        fs.writeFileSync(path.join(dir, 'sub/folder/file2'), 'goodbye');

        return io.walkDir(dir).then(seen => {
          assert.deepStrictEqual(
              seen,
              [{path: 'file1', dir: false},
               {path: 'sub', dir: true},
               {path: 'sub/folder', dir: true},
               {path: 'sub/folder/file2', dir: false}]);
        });
      });
    });
  })
});
