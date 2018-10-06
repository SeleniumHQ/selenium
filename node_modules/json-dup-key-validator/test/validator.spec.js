var fs = require('fs');
var expect = require('chai').expect;

var validator = require('../');

describe('test', function() {
  it('should validate empty object', function() {
    var emptyArr = '[]';
    var emptyObj = '{}';
    var emptyStr = '""';

    expect(validator.parse(emptyArr, false)).to.deep.equal([]);
    expect(validator.parse(emptyArr, true)).to.deep.equal([]);

    expect(validator.parse(emptyObj, false)).to.deep.equal({});
    expect(validator.parse(emptyObj, true)).to.deep.equal({});

    expect(validator.parse(emptyStr, false)).to.deep.equal("");
    expect(validator.parse(emptyStr, true)).to.deep.equal("");

    expect(validator.validate(emptyArr, false)).to.equal(undefined);
    expect(validator.validate(emptyObj, false)).to.equal(undefined);
    expect(validator.validate(emptyStr, false)).to.equal(undefined);
  });
  it('valid json', function() {
    var validJson = [{
      path: './test/fixture/valid-array.json',
      expectedValue: [
        true,
        false,
        null,
        "a string",
        123,
        -123,
        23.455,
        -23.455,
        {
          "k": "v"
        }, {}
      ]
    }, {
      path: './test/fixture/valid-object.json',
      expectedValue: {
        "a": "a string value",
        "with back quote\"": [
          123,
          234,
          345,
          3.451
        ],
        "with back spash\\": {
          "nested": [
            null,
            true,
            false
          ],
          "nestedEmptyArr": [],
          "nestedEmptyObj": {}
        }
      }
    }, {
      path: './test/fixture/valid-string.json',
      expectedValue: "this is a valid string"
    }, {
      path: './test/fixture/valid-number.json',
      expectedValue: 123.456
    }, {
      path: './test/fixture/valid-to-string.json',
      expectedValue: {
        toString: 'asd'
      }
    }];

    for (var i = 0; i < validJson.length; i++) {

      var content = fs.readFileSync(validJson[i].path, 'utf8') ;
      expect(validator.parse(content, false)).to.deep.equal(validJson[i].expectedValue);
      expect(validator.parse(content, true)).to.deep.equal(validJson[i].expectedValue);
    }
  });

  it('invalid json', function() {
    var invalidJson = [{
      path: './test/fixture/invalid-number.json',
      expectedError: 'Syntax error: expecting number near 3.112.24\n]'
    }, {
      path: './test/fixture/invalid-object.json',
      expectedError: 'Syntax error: expecting \':\' near d"": 123\n}'
    }, {
      path: './test/fixture/invalid-number-space.json',
      expectedError: 'Syntax error: expecting number near 3.112 24\n]'
    }, {
      path: './test/fixture/invalid-number-negative-negative.json',
      expectedError: 'Syntax error: expecting number near 3.112-24\n]'
    }];

    for (var i = 0; i < invalidJson.length; i++) {
      var content = fs.readFileSync(invalidJson[i].path, 'utf8') ;
      expect(validator.validate(content, false)).to.equal(invalidJson[i].expectedError);
      expect(validator.validate(content, true)).to.equal(invalidJson[i].expectedError);
    }
  });

  it('duplicated keys', function() {
    var content = fs.readFileSync('./test/fixture/duplicated-key.json', 'utf8') ;
    var errMessage = 'Syntax error: duplicated keys "a" near "a": 345\n}';
    expect(validator.validate(content, true)).to.equal(undefined);
    expect(validator.validate(content, false)).to.equal(errMessage);
    expect(validator.parse(content, true)).to.deep.equal({
      a: 345,
      b: 234
    });
    expect(function() {
      validator.parse(content, false)
    }).to.throw(errMessage);
  });

  it('should parse strings from json.stringify', function() {
    var obj = {
      "a": "a string value",
      "with back quote\"": [
        123,
        234,
        345,
        3.451
      ],
      "with back spash\\": {
        "nested": [
          null,
          true,
          false
        ]
      }
    };
    expect(validator.parse(JSON.stringify(obj))).to.deep.equal(obj);
  });
});