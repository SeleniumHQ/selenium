/**
* Compile
* (c) 2013 Bill, BunKat LLC.
*
* Compiles a single schedule definition into a form from which instances can be
* efficiently calculated from.
*
* Later is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/later
*/
later.compile = function(schedDef) {

  var constraints = [],
      constraintsLen = 0,
      tickConstraint;

  for(var key in schedDef) {
    var nameParts = key.split('_'),
        name = nameParts[0],
        mod = nameParts[1],
        vals = schedDef[key],
        constraint = mod ? later.modifier[mod](later[name], vals) : later[name];

    constraints.push({constraint: constraint, vals: vals});
    constraintsLen++;
  }

  // sort constraints based on their range for best performance (we want to
  // always skip the largest block of time possible to find the next valid
  // value)
  constraints.sort(function(a,b) {
    var ra = a.constraint.range, rb = b.constraint.range;
    return (rb < ra) ? -1 : (rb > ra) ? 1 : 0;
  });

  // this is the smallest constraint, we use this one to tick the schedule when
  // finding multiple instances
  tickConstraint = constraints[constraintsLen-1].constraint;

  /**
  * Returns a function to use when comparing two dates. Encapsulates the
  * difference between searching for instances forward and backwards so that
  * the same code can be completely reused for both directions.
  *
  * @param {String} dir: The direction to use, either 'next' or 'prev'
  */
  function compareFn(dir) {
    return dir === 'next' ?
      function(a,b) { return a.getTime() > b.getTime(); } :
      function(a,b) { return b.getTime() > a.getTime(); };
  }

  return {

    /**
    * Calculates the start of the next valid occurrence of a particular schedule
    * that occurs on or after the specified start time.
    *
    * @param {String} dir: Direction to search in ('next' or 'prev')
    * @param {Date} startDate: The first possible valid occurrence
    */
    start: function(dir, startDate) {
      var next = startDate,
          nextVal = later.array[dir],
          maxAttempts = 1000,
          done;

      while(maxAttempts-- && !done && next) {
        done = true;

        // verify all of the constraints in order since we want to make the
        // largest jumps possible to find the first valid value
        for(var i = 0; i < constraintsLen; i++) {

          var constraint = constraints[i].constraint,
              curVal = constraint.val(next),
              extent = constraint.extent(next),
              newVal = nextVal(curVal, constraints[i].vals, extent);

          if(!constraint.isValid(next, newVal)) {
            next = constraint[dir](next, newVal);
            done = false;
            break; // need to retest all constraints with new date
          }
        }
      }

      if(next !== later.NEVER) {
        next = dir === 'next' ? tickConstraint.start(next) :
          tickConstraint.end(next);
      }

      // if next, move to start of time period. needed when moving backwards
      return next;
    },

    /**
    * Given a valid start time, finds the next schedule that is invalid.
    * Useful for finding the end of a valid time range.
    *
    * @param {Date} startDate: The first possible valid occurrence
    */
    end: function(dir, startDate) {

      var result,
          nextVal = later.array[dir + 'Invalid'],
          compare = compareFn(dir);

      for(var i = constraintsLen-1; i >= 0; i--) {
        var constraint = constraints[i].constraint,
            curVal = constraint.val(startDate),
            extent = constraint.extent(startDate),
            newVal = nextVal(curVal, constraints[i].vals, extent),
            next;

        if(newVal !== undefined) { // constraint has invalid value, use that
          next = constraint[dir](startDate, newVal);
          if(next && (!result || compare(result, next))) {
            result = next;
          }
        }
      }

      return result;
    },

    /**
    * Ticks the date by the minimum constraint in this schedule
    *
    * @param {String} dir: Direction to tick in ('next' or 'prev')
    * @param {Date} date: The start date to tick from
    */
    tick: function(dir, date) {
      return new Date(dir === 'next' ?
        tickConstraint.end(date).getTime() + later.SEC :
        tickConstraint.start(date).getTime() - later.SEC);
    },

    /**
    * Ticks the date to the start of the minimum constraint
    *
    * @param {Date} date: The start date to tick from
    */
    tickStart: function(date) {
      return tickConstraint.start(date);
    }

  };
};