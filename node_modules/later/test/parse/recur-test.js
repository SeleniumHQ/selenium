var recur = require('../../index').parse.recur;
var should = require('should');

describe('Parse Recur', function() {

	describe('time periods', function() {

		it('should store second constraints with name s', function() {
			var r = recur().on(1).second();
			r.schedules[0].should.eql({s: [1]});
		});

		it('should store minute constraints with name m', function() {
			var r = recur().on(1).minute();
			r.schedules[0].should.eql({m: [1]});
		});

		it('should store hour constraints with name h', function() {
			var r = recur().on(1).hour();
			r.schedules[0].should.eql({h: [1]});
		});

		it('should store day of month constraints with name D', function() {
			var r = recur().on(1).dayOfMonth();
			r.schedules[0].should.eql({D: [1]});
		});

		it('should store day of week constraints with name d', function() {
			var r = recur().on(1).dayOfWeek();
			r.schedules[0].should.eql({d: [1]});
		});

		it('should store day of week count constraints with name dc', function() {
			var r = recur().on(1).dayOfWeekCount();
			r.schedules[0].should.eql({dc: [1]});
		});

		it('should store day of year constraints with name dy', function() {
			var r = recur().on(1).dayOfYear();
			r.schedules[0].should.eql({dy: [1]});
		});

		it('should store week of month constraints with name wm', function() {
			var r = recur().on(1).weekOfMonth();
			r.schedules[0].should.eql({wm: [1]});
		});

		it('should store week of year constraints with name wy', function() {
			var r = recur().on(1).weekOfYear();
			r.schedules[0].should.eql({wy: [1]});
		});

		it('should store month constraints with name M', function() {
			var r = recur().on(1).month();
			r.schedules[0].should.eql({M: [1]});
		});

		it('should store year constraints with name Y', function() {
			var r = recur().on(1).year();
			r.schedules[0].should.eql({Y: [1]});
		});

	});

	describe('on', function() {

		it('should store a single constraint', function() {
			var r = recur().on(2).minute();
			r.schedules[0].m.should.eql([2]);
		});

		it('should store multiple constraints', function() {
			var r = recur().on(2, 3).minute();
			r.schedules[0].m.should.eql([2, 3]);
		});

	});

	describe('every', function() {

		it('should calculate the appropriate minute constraint', function() {
			var r = recur().every(15).minute();
			r.schedules[0].m.should.eql([0, 15, 30, 45]);
		});

		it('should calculate the appropriate week of year constraint', function() {
			var r = recur().every(10).weekOfYear();
			r.schedules[0].wy.should.eql([1, 11, 21, 31, 41, 51]);
		});

	});

	describe('after', function() {

		it('should store the appropriate minute constraint', function() {
			var r = recur().after(15).minute();
			r.schedules[0].m_a.should.eql([15]);
		});

		it('should store the appropriate week of year constraint', function() {
			var r = recur().after(10).weekOfYear();
			r.schedules[0].wy_a.should.eql([10]);
		});

		it('should store the appropriate year constraint', function() {
			var r = recur().after(10).year();
			r.schedules[0].Y_a.should.eql([10]);
		});

	});

	describe('before', function() {

		it('should store the appropriate minute constraint', function() {
			var r = recur().before(15).minute();
			r.schedules[0].m_b.should.eql([15]);
		});

		it('should store the appropriate week of year constraint', function() {
			var r = recur().before(10).weekOfYear();
			r.schedules[0].wy_b.should.eql([10]);
		});

		it('should store the appropriate year constraint', function() {
			var r = recur().before(10).year();
			r.schedules[0].Y_b.should.eql([10]);
		});

	});

	describe('first', function() {

		it('should calculate the appropriate constraint', function() {
			var r = recur().first().minute();
			r.schedules[0].m.should.eql([0]);
		});

	});

	describe('last', function() {

		it('should calculate the appropriate constraint', function() {
			var r = recur().last().minute();
			r.schedules[0].m.should.eql([59]);
		});

	});


	describe('before time', function() {

		it('should store a single before time constraint', function() {
			var r = recur().before('08:30:00').time();
			r.schedules[0].t_b.should.eql([30600]);
		});

	});

	describe('after time', function() {

		it('should store a single after time constraint', function() {
			var r = recur().after('08:30:00').time();
			r.schedules[0].t_a.should.eql([30600]);
		});

	});

	describe('starting on', function() {

		it('should offset the start of an every constraint', function() {
			var r = recur().every(20).second().startingOn(8);
			r.schedules[0].s.should.eql([8, 28, 48]);
		});

		it('should ignore offsets that are too large', function() {
			var r = recur().every(20).second().startingOn(68);
			r.schedules[0].s.should.eql([]);
		});

	});

	describe('between', function() {

		it('should limit the start and end of an every constraint', function() {
			var r = recur().every(20).second().between(5, 40);
			r.schedules[0].s.should.eql([5, 25]);
		});

	});

	describe('and', function() {

		it('should create a composite schedule', function() {
			var r = recur().every(20).second().and().on(5).minute();
			r.schedules[0].s.should.eql([0, 20, 40]);
			r.schedules[1].m.should.eql([5]);
		});

		it('should create multiple composite schedules', function() {
			var r = recur().every(20).second().and().on(5).minute();
			r.and().on(0).month();
			r.schedules[0].s.should.eql([0, 20, 40]);
			r.schedules[1].m.should.eql([5]);
			r.schedules[2].M.should.eql([0]);
		});

	});

	describe('except', function() {

		it('should create an exception schedule', function() {
			var r = recur().except().on(5).minute();
			r.exceptions[0].m.should.eql([5]);
		});

		it('should create composite exception schedule', function() {
			var r = recur().except().on(5).minute().and().on(0).month();
			r.exceptions[0].m.should.eql([5]);
			r.exceptions[1].M.should.eql([0]);
		});

	});

});