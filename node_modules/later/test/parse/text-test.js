var parse = require('../../index').parse.text;
var should = require('should');

describe('Parse Text', function() {

	describe('every', function() {

		it('should parse every second restriction', function() {
			var p = parse('every 15 s');
			p.schedules[0].should.have.ownProperty('s');
			p.schedules[0].s.should.eql([0,15,30,45]);
		});

		it('should parse every minute restriction', function() {
			var p = parse('every 15 minutes');
			p.schedules[0].should.have.ownProperty('m');
			p.schedules[0].m.should.eql([0,15,30,45]);
		});

		it('should parse every minute restriction starting on 4', function() {
			var p = parse('every 15 minutes starting on the 4th minute');
			p.schedules[0].should.have.ownProperty('m');
			p.schedules[0].m.should.eql([4,19,34,49]);
		});

		it('should parse every hour restriction', function() {
			var p = parse('every 5 hours');
			p.schedules[0].should.have.ownProperty('h');
			p.schedules[0].h.should.eql([0,5,10,15,20]);
		});

		it('should parse every other hour between 5 and 10', function() {
			var p = parse('every 2 hours between the 5th and 10th hour');
			p.schedules[0].should.have.ownProperty('h');
			p.schedules[0].h.should.eql([5,7,9]);
		});

		it('should parse every day of week restriction', function() {
			var p = parse('every 2nd day of the week');
			p.schedules[0].should.have.ownProperty('d');
			p.schedules[0].d.should.eql([1,3,5,7]);
		});

		it('should parse every weekday restriction', function() {
			var p = parse('every weekday');
			p.schedules[0].should.have.ownProperty('d');
			p.schedules[0].d.should.eql([2,3,4,5,6]);
		});

		it('should parse every weekend restriction', function() {
			var p = parse('every weekend');
			p.schedules[0].should.have.ownProperty('d');
			p.schedules[0].d.should.eql([1,7]);
		});

		it('should parse every day of month restriction', function() {
			var p = parse('every 5 days of the month');
			p.schedules[0].should.have.ownProperty('D');
			p.schedules[0].D.should.eql([1,6,11,16,21,26,31]);
		});

		it('should parse every week of month restriction', function() {
			var p = parse('every 2 weeks of the month');
			p.schedules[0].should.have.ownProperty('wm');
			p.schedules[0].wm.should.eql([1,3,5]);
		});

		it('should parse every month restriction', function() {
			var p = parse('every 5 month');
			p.schedules[0].should.have.ownProperty('M');
			p.schedules[0].M.should.eql([1, 6, 11]);
		});

		it('should parse every week of year restriction', function() {
			var p = parse('every 10 weeks of the year');
			p.schedules[0].should.have.ownProperty('wy');
			p.schedules[0].wy.should.eql([1,11,21,31,41,51]);
		});

		it('should parse multiple restrictions', function() {
			var p = parse('every 30th m every 5 months');
			p.schedules[0].should.have.ownProperty('m');
			p.schedules[0].m.should.eql([0, 30]);
			p.schedules[0].should.have.ownProperty('M');
			p.schedules[0].M.should.eql([1, 6, 11]);
		});
	});

	describe('after', function() {

		it('should parse after second restriction', function() {
			var p = parse('after 15 s');
			p.schedules[0].should.have.ownProperty('s_a');
			p.schedules[0].s_a.should.eql([15]);
		});

		it('should parse after minute restriction', function() {
			var p = parse('after 15 minutes');
			p.schedules[0].should.have.ownProperty('m_a');
			p.schedules[0].m_a.should.eql([15]);
		});

		it('should parse after hour restriction', function() {
			var p = parse('after 5 hours');
			p.schedules[0].should.have.ownProperty('h_a');
			p.schedules[0].h_a.should.eql([5]);
		});

		it('should parse after day of week restriction', function() {
			var p = parse('after 2nd day of the week');
			p.schedules[0].should.have.ownProperty('d_a');
			p.schedules[0].d_a.should.eql([2]);
		});

		it('should parse after day of month restriction', function() {
			var p = parse('after 5 days of the month');
			p.schedules[0].should.have.ownProperty('D_a');
			p.schedules[0].D_a.should.eql([5]);
		});

		it('should parse after day restriction', function() {
			var p = parse('after 5 days');
			p.schedules[0].should.have.ownProperty('D_a');
			p.schedules[0].D_a.should.eql([5]);
		});

		it('should parse after day of year restriction', function() {
			var p = parse('after 5 days of the year');
			p.schedules[0].should.have.ownProperty('dy_a');
			p.schedules[0].dy_a.should.eql([5]);
		});

		it('should parse after week restriction', function() {
			var p = parse('after 2 weeks');
			p.schedules[0].should.have.ownProperty('wy_a');
			p.schedules[0].wy_a.should.eql([2]);
		});

		it('should parse after week of month restriction', function() {
			var p = parse('after 2 weeks of the month');
			p.schedules[0].should.have.ownProperty('wm_a');
			p.schedules[0].wm_a.should.eql([2]);
		});

		it('should parse after month restriction', function() {
			var p = parse('after 5 month');
			p.schedules[0].should.have.ownProperty('M_a');
			p.schedules[0].M_a.should.eql([5]);
		});

		it('should parse after week of year restriction', function() {
			var p = parse('after 10 weeks of the year');
			p.schedules[0].should.have.ownProperty('wy_a');
			p.schedules[0].wy_a.should.eql([10]);
		});

		it('should parse after year restriction', function() {
			var p = parse('after 10 years');
			p.schedules[0].should.have.ownProperty('Y_a');
			p.schedules[0].Y_a.should.eql([10]);
		});

		it('should parse after time restriction', function() {
			var p = parse('after 11:11pm');
			p.schedules[0].should.have.ownProperty('t_a');
			p.schedules[0].t_a.should.eql([83460]);
		});

		it('should parse multiple restrictions', function() {
			var p = parse('after 30th m after 5 months');
			p.schedules[0].should.have.ownProperty('m_a');
			p.schedules[0].m_a.should.eql([30]);
			p.schedules[0].should.have.ownProperty('M_a');
			p.schedules[0].M_a.should.eql([5]);
		});
	});

	describe('before', function() {

		it('should parse before second restriction', function() {
			var p = parse('before 15 s');
			p.schedules[0].should.have.ownProperty('s_b');
			p.schedules[0].s_b.should.eql([15]);
		});

		it('should parse before minute restriction', function() {
			var p = parse('before 15 minutes');
			p.schedules[0].should.have.ownProperty('m_b');
			p.schedules[0].m_b.should.eql([15]);
		});

		it('should parse before hour restriction', function() {
			var p = parse('before 5 hours');
			p.schedules[0].should.have.ownProperty('h_b');
			p.schedules[0].h_b.should.eql([5]);
		});

		it('should parse before day of week restriction', function() {
			var p = parse('before 2nd day of the week');
			p.schedules[0].should.have.ownProperty('d_b');
			p.schedules[0].d_b.should.eql([2]);
		});

		it('should parse before day of month restriction', function() {
			var p = parse('before 5 days of the month');
			p.schedules[0].should.have.ownProperty('D_b');
			p.schedules[0].D_b.should.eql([5]);
		});

		it('should parse before day restriction', function() {
			var p = parse('before 5 days');
			p.schedules[0].should.have.ownProperty('D_b');
			p.schedules[0].D_b.should.eql([5]);
		});

		it('should parse before day of year restriction', function() {
			var p = parse('before 5 days of the year');
			p.schedules[0].should.have.ownProperty('dy_b');
			p.schedules[0].dy_b.should.eql([5]);
		});

		it('should parse before week restriction', function() {
			var p = parse('before 2 weeks');
			p.schedules[0].should.have.ownProperty('wy_b');
			p.schedules[0].wy_b.should.eql([2]);
		});

		it('should parse before week of month restriction', function() {
			var p = parse('before 2 weeks of the month');
			p.schedules[0].should.have.ownProperty('wm_b');
			p.schedules[0].wm_b.should.eql([2]);
		});

		it('should parse before month restriction', function() {
			var p = parse('before 5 month');
			p.schedules[0].should.have.ownProperty('M_b');
			p.schedules[0].M_b.should.eql([5]);
		});

		it('should parse before week of year restriction', function() {
			var p = parse('before 10 weeks of the year');
			p.schedules[0].should.have.ownProperty('wy_b');
			p.schedules[0].wy_b.should.eql([10]);
		});

		it('should parse before year restriction', function() {
			var p = parse('before 10 years');
			p.schedules[0].should.have.ownProperty('Y_b');
			p.schedules[0].Y_b.should.eql([10]);
		});

		it('should parse before time restriction', function() {
			var p = parse('before 11:11pm');
			p.schedules[0].should.have.ownProperty('t_b');
			p.schedules[0].t_b.should.eql([83460]);
		});

		it('should parse multiple restrictions', function() {
			var p = parse('before 30th m before 5 months');
			p.schedules[0].should.have.ownProperty('m_b');
			p.schedules[0].m_b.should.eql([30]);
			p.schedules[0].should.have.ownProperty('M_b');
			p.schedules[0].M_b.should.eql([5]);
		});
	});

	describe('on', function() {

		it('should parse on second restriction', function() {
			var p = parse('on the 15 s');
			p.schedules[0].should.have.ownProperty('s');
			p.schedules[0].s.should.eql([15]);
		});

		it('should parse on second restriction using rank', function() {
			var p = parse('on the 15th s');
			p.schedules[0].should.have.ownProperty('s');
			p.schedules[0].s.should.eql([15]);
		});

		it('should parse on second restriction using range', function() {
			var p = parse('on the 15th-20th s');
			p.schedules[0].should.have.ownProperty('s');
			p.schedules[0].s.should.eql([15,16,17,18,19,20]);
		});

		it('should parse on minute restriction', function() {
			var p = parse('on the 15 minute');
			p.schedules[0].should.have.ownProperty('m');
			p.schedules[0].m.should.eql([15]);
		});

		it('should parse on multiple minute restriction', function() {
			var p = parse('on the 15,18,20 minute');
			p.schedules[0].should.have.ownProperty('m');
			p.schedules[0].m.should.eql([15,18,20]);
		});

		it('should parse on multiple minute restriction with range', function() {
			var p = parse('on the 15,18,20-23 minute');
			p.schedules[0].should.have.ownProperty('m');
			p.schedules[0].m.should.eql([15,18,20,21,22,23]);
		});

		it('should parse on hour restriction', function() {
			var p = parse('on the 5 hour');
			p.schedules[0].should.have.ownProperty('h');
			p.schedules[0].h.should.eql([5]);
		});

		it('should parse on the first hour restriction', function() {
			var p = parse('on the first hour');
			p.schedules[0].should.have.ownProperty('h');
			p.schedules[0].h.should.eql([0]);
		});

		it('should parse on day of week restriction', function() {
			var p = parse('on the 5th day of the week');
			p.schedules[0].should.have.ownProperty('d');
			p.schedules[0].d.should.eql([5]);
		});

		it('should parse on last day of week restriction', function() {
			var p = parse('on the last day of the week');
			p.schedules[0].should.have.ownProperty('d');
			p.schedules[0].d.should.eql([7]);
		});

		it('should parse on day of year restriction', function() {
			var p = parse('on the 5th day of the year');
			p.schedules[0].should.have.ownProperty('dy');
			p.schedules[0].dy.should.eql([5]);
		});

		it('should parse on day of week instance', function() {
			var p = parse('on the 3rd day instance');
			p.schedules[0].should.have.ownProperty('dc');
			p.schedules[0].dc.should.eql([3]);
		});

		it('should parse on day of month restriction', function() {
			var p = parse('on the 5th day of the month');
			p.schedules[0].should.have.ownProperty('D');
			p.schedules[0].D.should.eql([5]);
		});

		it('should parse on week of month restriction', function() {
			var p = parse('on the 5 week of the month');
			p.schedules[0].should.have.ownProperty('wm');
			p.schedules[0].wm.should.eql([5]);
		});

		it('should parse on month restriction', function() {
			var p = parse('on the 5 month');
			p.schedules[0].should.have.ownProperty('M');
			p.schedules[0].M.should.eql([5]);
		});

		it('should parse on week of year restriction', function() {
			var p = parse('on the 5 week of the year');
			p.schedules[0].should.have.ownProperty('wy');
			p.schedules[0].wy.should.eql([5]);
		});

		it('should parse on the last month restriction', function() {
			var p = parse('on the last month');
			p.schedules[0].should.have.ownProperty('M');
			p.schedules[0].M.should.eql([12]);
		});

		it('should parse on year restriction', function() {
			var p = parse('on the 2012 year');
			p.schedules[0].should.have.ownProperty('Y');
			p.schedules[0].Y.should.eql([2012]);
		});
	});

	describe('at', function() {

		it('should parse 24 hour time without leading zero', function() {
			var p = parse('at 5:00');
			p.schedules[0].should.have.ownProperty('t');
			p.schedules[0].t.should.eql([18000]);
		});

		it('should parse multiple 24 hour time without leading zero', function() {
			var p = parse('at 5:00,10:00');
			p.schedules[0].should.have.ownProperty('t');
			p.schedules[0].t.should.eql([18000, 36000]);
		});

		it('should parse 24 hour time', function() {
			var p = parse('at 05:00:00');
			p.schedules[0].should.have.ownProperty('t');
			p.schedules[0].t.should.eql([18000]);
		});

		it('should parse multiple 24 hour time', function() {
			var p = parse('at 05:00 and 10:00');
			p.schedules[0].should.have.ownProperty('t');
			p.schedules[0].t.should.eql([18000, 36000]);
		});

		it('should parse 12 hour time in the am', function() {
			var p = parse('at 5:00 am');
			p.schedules[0].should.have.ownProperty('t');
			p.schedules[0].t.should.eql([18000]);
		});

		it('should parse 12 hour time in the pm', function() {
			var p = parse('at 5:00 pm');
			p.schedules[0].should.have.ownProperty('t');
			p.schedules[0].t.should.eql([61200]);
		});
	});

	describe('on', function() {

		it('should parse day names', function() {
			var p = parse('on tues');
			p.schedules[0].d.should.eql([3]);
		});

		it('should parse day names with capitals', function() {
			var p = parse('on Fri');
			p.schedules[0].d.should.eql([6]);
		});

		it('should parse multiple day names', function() {
			var p = parse('on tues,wed');
			p.schedules[0].d.should.eql([3,4]);
		});

		it('should parse multiple day ranges', function() {
			var p = parse('on tues,thur-sat');
			p.schedules[0].d.should.eql([3,5,6,7]);
		});

	});

	describe('of', function() {

		it('should parse month names', function() {
			var p = parse('of may');
			p.schedules[0].M.should.eql([5]);
		});

		it('should parse multiple month names', function() {
			var p = parse('of may,dec');
			p.schedules[0].M.should.eql([5,12]);
		});

		it('should parse multiple month ranges', function() {
			var p = parse('of may-dec');
			p.schedules[0].M.should.eql([5,6,7,8,9,10,11,12]);
		});

	});

	describe('in', function() {

		it('should parse years', function() {
			var p = parse('in 2012');
			p.schedules[0].Y.should.eql([2012]);
		});

		it('should parse multiple years', function() {
			var p = parse('in 2014,2015');
			p.schedules[0].Y.should.eql([2014,2015]);
		});

		it('should parse multiple year ranges', function() {
			var p = parse('in 2012,2014-2016');
			p.schedules[0].Y.should.eql([2012,2014,2015,2016]);
		});

	});

	describe('also', function() {

		it('should create a composite schedule', function() {
			var p = parse('at 5:00 also at 10:00');
			p.schedules[0].t.should.eql([18000]);
			p.schedules[1].t.should.eql([36000]);
		});

	});

	describe('except', function() {

		it('should create an exception schedule', function() {
			var p = parse('at 5:00 except at 10:00');
			p.schedules[0].t.should.eql([18000]);
			p.exceptions[0].t.should.eql([36000]);
		});

	});

	describe('error', function() {

		it('should return the position of the first error', function() {
			var p = parse('at 5:00 except on 10:00');
			p.error.should.eql(18);
		});

	});
});