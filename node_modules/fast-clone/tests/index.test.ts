import { expect } from 'chai';
const clone = require('../');

describe('When cloning', function () {

  describe('a string', function () {
    it('should return a matching string', function () {
      expect(clone('Hello world')).to.equal('Hello world');
    });
  });

  describe('a number', function () {
    it('should return a matching number', function () {
      expect(clone(3.14)).to.equal(3.14);
      expect(clone(-1)).to.equal(-1);
    });
  });

  describe('a boolean', function () {
    it('should return a matching boolean', function () {
      expect(clone(true)).to.equal(true);
      expect(clone(false)).to.equal(false);
    });
  });

  describe('NaN', function () {
    it('should return NaN', function () {
      expect(clone(NaN)).to.be.NaN;
    });
  });

  describe('Infinity', function () {
    it('should return Infinity', function () {
      expect(clone(Number.POSITIVE_INFINITY)).to.equal(Number.POSITIVE_INFINITY);
    });
  });

  describe('Negative Infinity', function () {
    it('should return Negative Infinity', function () {
      expect(clone(Number.NEGATIVE_INFINITY)).to.equal(Number.NEGATIVE_INFINITY);
    });
  });

  describe('null', function () {
    it('should return null', function () {
      expect(clone(null)).to.equal(null);
    });
  });

  describe('undefined', function () {
    it('should return undefined', function () {
      expect(clone(undefined)).to.equal(undefined);
    });
  });

  describe('a RegExp', function () {
    let expected;
    let actual;
    let hisName = 'Mr Plow, thats his name, that name again is Mr Plow'

    beforeEach(function () {
      expected = new RegExp("plow", "gi");
      actual = clone(expected);
    });

    it('should return a different RexExp Object', function () {
      expect(actual).to.not.equal(expected);
    });

    it('should have the same pattern', function () {
      expect(actual.source).to.equal(expected.source);
    });

    it('should have the same flags', function () {
      expect(actual.global).to.equal(expected.global);
      expect(actual.ignoreCase).to.equal(expected.ignoreCase);
      expect(actual.multiline).to.equal(expected.multiline);
    });

    it('should match the same string', function () {
      expect(hisName.search(actual)).to.equal(hisName.search(expected));

      const expectedMatch = hisName.match(expected);
      const actualMatch = hisName.match(actual);

      expectedMatch.forEach(function (match, key) {
        expect(actualMatch[key]).to.equal(match);
      });

    });
  });

  describe('a date', function () {
    let expected;
    let actual;

    beforeEach(function () {
      expected = new Date('1997-08-29T00:00:00.000+1000');
      actual = clone(expected);
    });

    it('should return the same date', function () {
      expect(actual.getFullYear()).to.equal(expected.getFullYear());
      expect(actual.getMonth()).to.equal(expected.getMonth());
      expect(actual.getDate()).to.equal(expected.getDate());
    });

    it('should return the same time', function () {
      expect(actual.getTime()).to.equal(expected.getTime());
    });

    it('should return the same timezone', function () {
      expect(actual.getTimezoneOffset()).to.equal(expected.getTimezoneOffset());
    });
  });

  describe('an array', function () {
    it('should return a new array', function () {
      const a = [1, 2, 3];
      const b = clone(a);
      expect(b).to.not.equal(a);
    });

    function elementsShouldMatch(a, b) {
      for (let index = 0; index < a.length; index++) {
        const originalType = typeof a[index];
        const newType = typeof b[index];

        expect(newType).to.equal(originalType);
        expect(b[index]).to.equal(a[index]);
      }
    }

    describe('of numbers', function () {
      it('should return array of matching numbers', function () {
        const a = [1, 2, 3];
        const b = clone(a);
        expect(b).to.eql(a);
      });

      describe('containing NaN and Infinity', function () {
        it('should return array of NaN and Infinity', function () {
          const a = [NaN, Infinity];
          const b = clone(a);
          expect(b[0]).to.be.NaN;
          expect(b[1]).to.equal(Infinity);
        });
      });
    });

    describe('of strings', function () {
      it('should return array of matching strings', function () {
        const a = ['a', 'b', 'c'];
        const b = clone(a);
        expect(b).to.eql(a);
      });
    });

    describe('of booleans', function () {
      it('should return array of matching booleans', function () {
        const a = [true, false];
        const b = clone(a);
        expect(b).to.eql(a);
      });
    });

    describe('of Dates', function () {
      let a, b;

      beforeEach(function () {
        a = [new Date()];
        b = clone(a);
      });

      it('should return array containing new Date instances', function () {
        expect(b[0]).to.not.equal(a[0]);
      });

      it('should return array of matching Dates', function () {
        expect(b).to.eql(a);
      });
    });

    describe('of Regex', function () {
      let expected;
      let actual;
      const hisName = 'Mr Plow, thats his name, that name again is Mr Plow'

      beforeEach(function () {
        expected = [new RegExp("plow", "gi"), /mr/gi, /name/];
        actual = clone(expected);
      });

      it('should return array containing new RexExp instances', function () {
        for (let i = 0; i < expected.length; i++) {
          expect(actual[i]).to.not.equal(expected[i]);
        }
      });

      it('should return array of matching RegExp', function () {
        for (let i = 0; i < expected.length; i++) {

          expect(actual[i].source).to.equal(expected[i].source);

          expect(actual[i].global).to.equal(expected[i].global);
          expect(actual[i].ignoreCase).to.equal(expected[i].ignoreCase);
          expect(actual[i].multiline).to.equal(expected[i].multiline);

          expect(hisName.search(actual[i])).to.equal(hisName.search(expected[i]));

          const expectedMatch = hisName.match(expected[i]);
          const actualMatch = hisName.match(actual[i]);

          expectedMatch.forEach(function (match, key) {
            expect(actualMatch[key]).to.equal(match);
          });
        }
      });


    })
  });

  describe('an object', function () {
    let a, b;

    beforeEach(function () {
      a = {
        text: 'Mr Plow, thats his name, that name again is Mr Plow',
        num: 3.14,
        day: new Date('1997-08-29T00:00:00.000Z'),
        yes: true,
        no: false,
        badNum: NaN,
        lots: Infinity,

        subObject: {
          text: 'Mr Plow, thats his name, that name again is Mr Plow',
          num: 3.14,
          day: new Date('1997-08-29T00:00:00.000Z'),
          yes: true,
          no: false,
          badNum: NaN,
          lots: Infinity
        },

        items: [
          'Mr Plow, thats his name, that name again is Mr Plow',
          3.14,
          new Date('1997-08-29T00:00:00.000Z'),
          true,
          false,
          NaN,
          Infinity,
          {
            text: 'Mr Plow, thats his name, that name again is Mr Plow',
            num: 3.14,
            day: new Date('1997-08-29T00:00:00.000Z'),
            yes: true,
            no: false,
            badNum: NaN,
            lots: Infinity
          },
          [
            'Yo dawg, I heard you like arrays',
            [
              'So we put an array',
              { text: 'In your array' }
            ]
          ]
        ]
      };

      b = clone(a);
    });

    it('should return a new object', function () {
      // Objects should be different instances
      expect(b).to.not.equal(a);
      expect(b.subObject).to.not.equal(a.subObject);
      expect(b.items).to.not.equal(a.items);
      expect(b.items[7]).to.not.equal(a.items[7]);
      expect(b.items[8][1][1]).to.not.equal(a.items[8][1][1]);
    });

    it('should have properties and sub-properties that match', function () {
      expect(b).to.eql(a);
    });
  });
});
