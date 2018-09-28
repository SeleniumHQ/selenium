var parse = require('../../index').parse.cron;
var should = require('should');

describe('Parse Cron', function() {

	describe('seconds', function() {

		it('should parse all asterisk to mean every second', function() {
			var p = parse('* * * * * *', true);
			p.schedules[0].should.eql({s: [
				0,1,2,3,4,5,6,7,8,9,
				10,11,12,13,14,15,16,17,18,19,
				20,21,22,23,24,25,26,27,28,29,
				30,31,32,33,34,35,36,37,38,39,
				40,41,42,43,44,45,46,47,48,49,
				50,51,52,53,54,55,56,57,58,59]});
		});

		it('should parse a single value', function() {
			var p = parse('1 * * * * *', true);
			p.schedules[0].should.eql({s: [1]});
		});

		it('should parse multiple values', function() {
			var p = parse('1,5,10 * * * * *', true);
			p.schedules[0].should.eql({s: [1,5,10]});
		});

		it('should parse unsorted values and sort them', function() {
			var p = parse('1,10,5 * * * * *', true);
			p.schedules[0].should.eql({s: [1,5,10]});
		});

		it('should parse a range value', function() {
			var p = parse('1-5 * * * * *', true);
			p.schedules[0].should.eql({s: [1,2,3,4,5]});
		});

		it('should parse a range with increment value', function() {
			var p = parse('1-6/2 * * * * *', true);
			p.schedules[0].should.eql({s: [1,3,5]});
		});

		it('should parse an asterisk with increment value', function() {
			var p = parse('*/10 * * * * *', true);
			p.schedules[0].should.eql({s: [0,10,20,30,40,50]});
		});

		it('should parse a zero with increment value', function() {
			var p = parse('0/10 * * * * *', true);
			p.schedules[0].should.eql({s: [0,10,20,30,40,50]});
		});

		it('should parse a non-zero with increment value', function() {
			var p = parse('5/15 * * * *', true);
			p.schedules[0].should.eql({s: [5,20,35,50]});
		});

		it('should parse with various spaces and/or tabs', function() {
			var p = parse('1-6/2    * * 		* * *', true);
			p.schedules[0].should.eql({s: [1,3,5]});
		});

	});

	describe('minutes', function() {

		it('should parse asterisk to mean any value', function() {
			var p = parse('0 * * * * *', true);
			p.schedules[0].should.not.have.ownProperty('m');
		});

		it('should parse all asterisk to mean every minute at zero seconds', function() {
			var p = parse('* * * * *');
			p.schedules[0].should.eql({s: [0]});
		});

		it('should parse a single value', function() {
			var p = parse('* 1 * * * *', true);
			p.schedules[0].should.eql({m: [1]});
		});

		it('should parse multiple values', function() {
			var p = parse('* 10,5,1 * * * *', true);
			p.schedules[0].should.eql({m: [1,5,10]});
		});

		it('should parse a range value', function() {
			var p = parse('* 1-5 * * * *', true);
			p.schedules[0].should.eql({m: [1,2,3,4,5]});
		});

		it('should parse a range with increment value', function() {
			var p = parse('* 1-6/2 * * * *', true);
			p.schedules[0].should.eql({m: [1,3,5]});
		});

		it('should parse an asterisk with increment value', function() {
			var p = parse('* */20 * * * *', true);
			p.schedules[0].should.eql({m: [0,20,40]});
		});

		it('should parse a 0 with increment value', function() {
			var p = parse('* 0/20 * * * *', true);
			p.schedules[0].should.eql({m: [0,20,40]});
		});

		it('should parse a non-zero with increment value', function() {
			var p = parse('0 4/10 * * * *', true);
			p.schedules[0].should.eql({s: [0], m: [4,14,24,34,44,54]});
		});

		it('should parse issue #100 correctly', function() {
			var p = parse('4,9,14,19,24,29,34,39,44,49,54,59 * * * *', false);
			p.schedules[0].should.eql({s: [0], m: [4,9,14,19,24,29,34,39,44,49,54,59]});
		});

	});

	describe('hours', function() {

		it('should parse asterisk to mean any value', function() {
			var p = parse('* 0 * * * *', true);
			p.schedules[0].should.not.have.ownProperty('h');
		});

		it('should parse a single value', function() {
			var p = parse('* * 1 * * *', true);
			p.schedules[0].should.eql({h: [1]});
		});

		it('should parse multiple values', function() {
			var p = parse('* * 1,5,10 * * *', true);
			p.schedules[0].should.eql({h: [1,5,10]});
		});

		it('should parse a range value', function() {
			var p = parse('* * 1-5 * * *', true);
			p.schedules[0].should.eql({h: [1,2,3,4,5]});
		});

		it('should parse a range with increment value', function() {
			var p = parse('* * 1-6/2 * * *', true);
			p.schedules[0].should.eql({h: [1,3,5]});
		});

		it('should parse an asterisk with increment value', function() {
			var p = parse('* * */10 * * *', true);
			p.schedules[0].should.eql({h: [0,10,20]});
		});

		it('should parse a 0 with increment value', function() {
			var p = parse('* * 0/10 * * *', true);
			p.schedules[0].should.eql({h: [0,10,20]});
		});

		it('should parse a non-zero with increment value', function() {
			var p = parse('* * 5/10 * * *', true);
			p.schedules[0].should.eql({h: [5, 15]});
		});

		it('should parse with various spaces and/or tabs', function() {
			var p = parse('* 		*    5/10 *   * *', true);
			p.schedules[0].should.eql({h: [5, 15]});
		});

		it('should parse issue #107 correctly', function() {
			var p = parse('* */4,16,18-20 * * *');
			p.schedules[0].should.eql({s: [0], h: [0, 4, 8, 12, 16, 18, 19, 20]});
		});
	});

	describe('day of month', function() {

		it('should parse asterisk to mean any value', function() {
			var p = parse('0 0 0 * * *', true);
			p.schedules[0].should.not.have.ownProperty('D');
		});

		it('should parse ? to mean any value', function() {
			var p = parse('* * * ? * *', true);
			p.schedules[0].should.not.have.ownProperty('D');
		});

		it('should parse a single value', function() {
			var p = parse('* * * 1 * *', true);
			p.schedules[0].should.eql({D: [1]});
		});

		it('should parse multiple values', function() {
			var p = parse('* * * 1,5,10 * *', true);
			p.schedules[0].should.eql({D: [1,5,10]});
		});

		it('should parse a range value', function() {
			var p = parse('* * * 1-5 * *', true);
			p.schedules[0].should.eql({D: [1,2,3,4,5]});
		});

		it('should parse a range with increment value', function() {
			var p = parse('* * * 1-6/2 * *', true);
			p.schedules[0].should.eql({D: [1,3,5]});
		});

		it('should parse an asterisk with increment value', function() {
			var p = parse('* * * */10 * *', true);
			p.schedules[0].should.eql({D: [1,11,21,31]});
		});

		it('should parse last', function() {
			var p = parse('* * * L * *', true);
			p.schedules[0].should.eql({D: [0]});
		});

		it('should parse a single nearest first weekday', function() {
			var p = parse('* * * 1W * *', true);
			p.schedules[0].should.eql({D: [1, 2, 3], d:[2,3,4,5,6]});
			p.exceptions[0].should.eql({D: [2], d:[3,4,5,6]});
			p.exceptions[1].should.eql({D: [3], d:[3,4,5,6]});
		});

		it('should parse a single nearest weekday', function() {
			var p = parse('* * * 15W * *', true);
			p.schedules[0].should.eql({D: [14, 15, 16], d:[2,3,4,5,6]});
			p.exceptions[0].should.eql({D: [14], d:[2,3,4,5]});
			p.exceptions[1].should.eql({D: [16], d:[3,4,5,6]});
		});

		it('should parse multiple single nearest weekday', function() {
			var p = parse('* * * 4W,15W * *', true);
			p.schedules[0].should.eql({D: [3, 4, 5, 14, 15, 16], d:[2,3,4,5,6]});
			p.exceptions[0].should.eql({D: [3], d:[2,3,4,5]});
			p.exceptions[1].should.eql({D: [5], d:[3,4,5,6]});
			p.exceptions[2].should.eql({D: [14], d:[2,3,4,5]});
			p.exceptions[3].should.eql({D: [16], d:[3,4,5,6]});
		});

	});

	describe('months', function() {

		it('should parse asterisk to mean any value', function() {
			var p = parse('0 0 0 0 * *', true);
			p.schedules[0].should.not.have.ownProperty('M');
		});

		it('should parse a single value', function() {
			var p = parse('* * * * 1 *', true);
			p.schedules[0].should.eql({M: [1]});
		});

		it('should parse multiple values', function() {
			var p = parse('* * * * 1,5,10 *', true);
			p.schedules[0].should.eql({M: [1,5,10]});
		});

		it('should parse a range value', function() {
			var p = parse('* * * * 1-5 *', true);
			p.schedules[0].should.eql({M: [1,2,3,4,5]});
		});

		it('should parse a range with increment value', function() {
			var p = parse('* * * * 1-6/2 *', true);
			p.schedules[0].should.eql({M: [1,3,5]});
		});

		it('should parse an asterisk with increment value', function() {
			var p = parse('* * * * */5 *', true);
			p.schedules[0].should.eql({M: [1,6,11]});
		});

		it('should parse a single value in words', function() {
			var p = parse('* * * * JAN *', true);
			p.schedules[0].should.eql({M: [1]});
		});

		it('should parse multiple values in words', function() {
			var p = parse('* * * * JAN,MAY,OCT *', true);
			p.schedules[0].should.eql({M: [1,5,10]});
		});

		it('should parse a range value in words', function() {
			var p = parse('* * * * JAN-MAY *', true);
			p.schedules[0].should.eql({M: [1,2,3,4,5]});
		});

		it('should parse a range with increment value in words', function() {
			var p = parse('* * * * JAN-JUN/2 *', true);
			p.schedules[0].should.eql({M: [1,3,5]});
		});

	});

	describe('day of week', function() {

		it('should parse asterisk to mean any value', function() {
			var p = parse('0 0 0 0 0 *', true);
			p.schedules[0].should.not.have.ownProperty('d');
		});

		it('should parse ? to mean any value', function() {
			var p = parse('* * * * * ?', true);
			p.schedules[0].should.not.have.ownProperty('d');
		});

		it('should parse a single value', function() {
			var p = parse('* * * * * 1', true);
			p.schedules[0].should.eql({d: [2]});
		});

		it('should parse 7 as Sunday', function() {
			var p = parse('* * * * * 7', true);
			p.schedules[0].should.eql({d: [7]});
		});

		it('should parse multiple values', function() {
			var p = parse('* * * * * 1,2,5', true);
			p.schedules[0].should.eql({d: [2,3,6]});
		});

		it('should parse multiple values with 7', function() {
			var p = parse('* * * * * 1,2,5,7', true);
			p.schedules[0].should.eql({d: [2,3,6,7]});
		});

		it('should parse a range value', function() {
			var p = parse('* * * * * 1-5', true);
			p.schedules[0].should.eql({d: [2,3,4,5,6]});
		});

		it('should parse a range with increment value', function() {
			var p = parse('* * * * * 1-6/2', true);
			p.schedules[0].should.eql({d: [2,4,6]});
		});

		it('should parse an asterisk with increment value', function() {
			var p = parse('* * * * * */3', true);
			p.schedules[0].should.eql({d: [1,4,7]});
		});

		it('should parse last', function() {
			var p = parse('* * * * * 5L', true);
			p.schedules[0].should.eql({d: [6], dc: [0]});
		});

		it('should parse last in combination', function() {
			var p = parse('* * * * * 4,5L', true);
			p.schedules[0].should.eql({d: [5]});
			p.schedules[1].should.eql({d: [6], dc: [0]});
		});

		it('should parse last in combination', function() {
			var p = parse('* * * * * 5L,4', true);
			p.schedules[0].should.eql({d: [5]});
			p.schedules[1].should.eql({d: [6], dc: [0]});
		});

		it('should parse multiple last', function() {
			var p = parse('* * * * * 4L,5L', true);
			p.schedules[0].should.eql({d: [5,6], dc: [0]});
		});

		it('should parse a single day instance', function() {
			var p = parse('* * * * * 1#2', true);
			p.schedules[0].should.eql({d: [2], dc:[2]});
		});

		it('should parse multiple single day instance', function() {
			var p = parse('* * * * * 1#2,3#3', true);
			p.schedules[0].should.eql({d: [2], dc:[2]});
			p.schedules[1].should.eql({d: [4], dc:[3]});
		});

		it('should parse multiple single day instance with mins and secs', function() {
			var p = parse('5 5 * * * 1#2,3#3', true);
			p.schedules[0].should.eql({s: [5], m:[5], d: [2], dc:[2]});
			p.schedules[1].should.eql({s: [5], m:[5], d: [4], dc:[3]});
		});

		it('should parse multiple single day instance in combination', function() {
			var p = parse('* * * * * 2,1#2,3#3', true);
			p.schedules[0].should.eql({d: [3]});
			p.schedules[1].should.eql({d: [2], dc:[2]});
			p.schedules[2].should.eql({d: [4], dc:[3]});
		});

		it('should parse multiple single day instance in combination with 7', function() {
			var p = parse('* * * * * 2,1#2,7#3', true);
			p.schedules[0].should.eql({d: [3]});
			p.schedules[1].should.eql({d: [2], dc:[2]});
			p.schedules[2].should.eql({d: [7], dc:[3]});
		});

		it('should parse a single value in words', function() {
			var p = parse('* * * * * MON', true);
			p.schedules[0].should.eql({d: [2]});
		});

		it('should parse multiple values in words', function() {
			var p = parse('* * * * * MON,TUE,FRI', true);
			p.schedules[0].should.eql({d: [2,3,6]});
		});

		it('should parse a range value in words', function() {
			var p = parse('* * * * * MON-FRI', true);
			p.schedules[0].should.eql({d: [2,3,4,5,6]});
		});

		it('should parse a range with increment value in words', function() {
			var p = parse('* * * * * MON-SAT/2', true);
			p.schedules[0].should.eql({d: [2,4,6]});
		});

	});

	describe('years', function() {

		it('should parse asterisk to mean any value', function() {
			var p = parse('0 0 0 0 0 0 *', true);
			p.schedules[0].should.not.have.ownProperty('Y');
		});

		it('should parse a single value', function() {
			var p = parse('* * * * * * 2012', true);
			p.schedules[0].should.eql({Y: [2012]});
		});

		it('should parse multiple values', function() {
			var p = parse('* * * * * * 2012,2014,2020', true);
			p.schedules[0].should.eql({Y: [2012,2014,2020]});
		});

		it('should parse a range value', function() {
			var p = parse('* * * * * * 2012-2014', true);
			p.schedules[0].should.eql({Y: [2012,2013,2014]});
		});

		it('should parse a range with increment value', function() {
			var p = parse('* * * * * * 2012-2016/2', true);
			p.schedules[0].should.eql({Y: [2012,2014,2016]});
		});

		it('should parse an asterisk with increment value', function() {
			var p = parse('* * * * * * */100', true);
			p.schedules[0].should.eql({Y: [1970,2070]});
		});

	});

	describe('keywords', function() {

		it('should parse @yearly', function() {
			var p = parse('@yearly', false);
			var pe = parse('0 0 1 1 *', false);
			p.schedules[0].should.eql(pe.schedules[0]);
		});

		it('should parse @annually', function() {
			var p = parse('@annually', false);
			var pe = parse('0 0 1 1 *', false);
			p.schedules[0].should.eql(pe.schedules[0]);
		});

		it('should parse @monthly', function() {
			var p = parse('@monthly', false);
			var pe = parse('0 0 1 * *', false);
			p.schedules[0].should.eql(pe.schedules[0]);
		});

		it('should parse @weekly', function() {
			var p = parse('@weekly', false);
			var pe = parse('0 0 * * 0', false);
			p.schedules[0].should.eql(pe.schedules[0]);
		});

		it('should parse @daily', function() {
			var p = parse('@daily', false);
			var pe = parse('0 0 * * *', false);
			p.schedules[0].should.eql(pe.schedules[0]);
		});

		it('should parse @hourly', function() {
			var p = parse('@hourly', false);
			var pe = parse('0 * * * *', false);
			p.schedules[0].should.eql(pe.schedules[0]);
		});

	});
});