var
  vows   = require('vows'),
  assert = require('assert'),

  path       = require('path'),
  fs         = require('fs'),
  existsSync = fs.existsSync || path.existsSync,

  tmp    = require('../lib/tmp.js'),
  Test   = require('./base.js');


function _testDir(mode) {
  return function _testDirGenerated(result) {
    assert.ok(existsSync(result.name), 'should exist');

    var stat = fs.statSync(result.name);
    assert.ok(stat.isDirectory(), 'should be a directory');

    Test.testStat(stat, mode);
  };
}

vows.describe('Synchronous directory creation').addBatch({
  'when using without parameters': {
    topic: function () {
      return tmp.dirSync();
    },

    'should return with a name': Test.assertNameSync,
    'should be a directory': _testDir(040700),
    'should have the default prefix': Test.testPrefixSync('tmp-')
  },

  'when using with prefix': {
    topic: function () {
      return tmp.dirSync({ prefix: 'something' });
    },

    'should return with a name': Test.assertNameSync,
    'should be a directory': _testDir(040700),
    'should have the provided prefix': Test.testPrefixSync('something')
  },

  'when using with postfix': {
    topic: function () {
      return tmp.dirSync({ postfix: '.txt' });
    },

    'should return with a name': Test.assertNameSync,
    'should be a directory': _testDir(040700),
    'should have the provided postfix': Test.testPostfixSync('.txt')
  },

  'when using template': {
    topic: function () {
      return tmp.dirSync({ template: path.join(tmp.tmpdir, 'clike-XXXXXX-postfix') });
    },

    'should return with a name': Test.assertNameSync,
    'should be a directory': _testDir(040700),
    'should have the provided prefix': Test.testPrefixSync('clike-'),
    'should have the provided postfix': Test.testPostfixSync('-postfix')
  },

  'when using name': {
    topic: function () {
      return tmp.dirSync({ name: 'using-name' });
    },

    'should return with a name': Test.assertNameSync,
    'should have the provided name': Test.testNameSync(path.join(tmp.tmpdir, 'using-name')),
    'should be a directory': function (result) {
      _testDir(040700)(result);
      result.removeCallback();
      assert.ok(!existsSync(result.name), 'Directory should be removed');
    }
  },

  'when using multiple options': {
    topic: function () {
      return tmp.dirSync({ prefix: 'foo', postfix: 'bar', mode: 0750 });
    },

    'should return with a name': Test.assertNameSync,
    'should be a directory': _testDir(040750),
    'should have the provided prefix': Test.testPrefixSync('foo'),
    'should have the provided postfix': Test.testPostfixSync('bar')
  },

  'when using multiple options and mode': {
    topic: function () {
      return tmp.dirSync({ prefix: 'complicated', postfix: 'options', mode: 0755 });
    },

    'should return with a name': Test.assertNameSync,
    'should be a directory': _testDir(040755),
    'should have the provided prefix': Test.testPrefixSync('complicated'),
    'should have the provided postfix': Test.testPostfixSync('options')
  },

  'no tries': {
    topic: function () {
      try {
        return tmp.dirSync({ tries: -1 });
      }
      catch (e) {
        return e;
      }
    },

    'should return with an error': function (topic) {
      assert.instanceOf(topic, Error);
    }
  },

  'keep testing': {
    topic: function () {
      Test.testKeepSync('dir', '1', this.callback);
    },

    'should not return with an error': assert.isNull,
    'should return with a name': Test.assertName,
    'should be a dir': function (err, name) {
      _testDir(040700)({ name: name });
      fs.rmdirSync(name);
    }
  },

  'unlink testing': {
    topic: function () {
      Test.testKeepSync('dir', '0', this.callback);
    },

    'should not return with error': assert.isNull,
    'should return with a name': Test.assertName,
    'should not exist': function (err, name) {
      assert.ok(!existsSync(name), 'Directory should be removed');
    }
  },

  'non graceful testing': {
    topic: function () {
      Test.testGracefulSync('dir', '0', this.callback);
    },

    'should not return with error': assert.isNull,
    'should return with a name': Test.assertName,
    'should be a dir': function (err, name) {
      _testDir(040700)({ name: name });
      fs.rmdirSync(name);
    }
  },

  'graceful testing': {
    topic: function () {
      Test.testGracefulSync('dir', '1', this.callback);
    },

    'should not return with an error': assert.isNull,
    'should return with a name': Test.assertName,
    'should not exist': function (err, name) {
      assert.ok(!existsSync(name), 'Directory should be removed');
    }
  },

  'unsafeCleanup === true': {
    topic: function () {
      Test.testUnsafeCleanupSync('1', this.callback);
    },

    'should not return with an error': assert.isNull,
    'should return with a name': Test.assertName,
    'should not exist': function (err, name) {
      assert.ok(!existsSync(name), 'Directory should be removed');
    },
    'should remove symlinked dir': function(err, name) {
      assert.ok(
        !existsSync(name + '/symlinkme-target'),
        'should remove target'
      );
    },
    'should not remove contents of symlink dir': function(err, name) {
      assert.ok(
        existsSync(__dirname + '/symlinkme/file.js'),
        'should not remove symlinked directory\'s content'
      );
    }
  },

  'unsafeCleanup === true with issue62 structure': {
    topic: function () {
      Test.testIssue62Sync(this.callback);
    },

    'should not return with an error': assert.isNull,
    'should return with a name': Test.assertName,
    'should not exist': function (err, name) {
      assert.ok(!existsSync(name), 'Directory should be removed');
    }
  },

  'unsafeCleanup === false': {
    topic: function () {
      Test.testUnsafeCleanupSync('0', this.callback);
    },

    'should not return with an error': assert.isNull,
    'should return with a name': Test.assertName,
    'should be a directory': function (err, name) {
       _testDir(040700)({name:name});
      // make sure that everything gets cleaned up
      fs.unlinkSync(path.join(name, 'should-be-removed.file'));
      fs.unlinkSync(path.join(name, 'symlinkme-target'));
      fs.rmdirSync(name);
    }
  },

  'remove callback': {
    topic: function () {
      return tmp.dirSync();
    },

    'should return with a name': Test.assertNameSync,
    'removeCallback should remove directory': function (result) {
      result.removeCallback();
      assert.ok(!existsSync(result.name), 'Directory should be removed');
    }
  }
}).exportTo(module);
