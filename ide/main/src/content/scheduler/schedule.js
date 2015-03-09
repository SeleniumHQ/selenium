/*
 * Scheduler - a Javascript based scheduler
 *
 * Copyright 2014,2015 Samit Badle
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Schedule = (function () {

  function Schedule(days, hours, mins) {
    this.days = parse(days, 6);    //(0-6) = (Sun - Sat)
    this.hours = parse(hours, 23); //(0-23)
    this.mins = parse(mins, 11);   //(0-11) = (0,5,10,...55)
  }

  Schedule.fromData = function(data) {
    return new Schedule(data.days, data.hours, data.mins);
  };

  Schedule.prototype.getData = function() {
    return { days: this.days, hours: this.hours, mins: this.mins };
  };

  Schedule.prototype.setData = function(data) {
    this.days = data.days;
    this.hours = data.hours;
    this.mins = data.mins;
    return this;
  };

  Schedule.prototype.next = function(after, prev) {
    var runDate = new RunDate(after || new Date());
    if (prev && runDate.equals(prev)) {
      runDate.add(1);
    }
    for (var d = 0; d <= 7; d++) {
      if (this.days[runDate.day]) {
        for (var h = runDate.hour; h <= 23; h++) {
          if (this.hours[h]) {
            for (var m = runDate.min; m <= 11; m++) {
              if (this.mins[m]) {
                runDate.add(m - runDate.min);
                return runDate.toDate();
              }
            }
          }
          runDate.nextHour();
        }
      } else {
        runDate.nextDay();
      }
    }
    return null;
  };

  function parse(value, maxValue) {
    if (Array.isArray(value)) {
      if (value.length == maxValue + 1) {
        return value;
      }
      // TODO invalid array
      return null;
    } else if (value) { //String
      var matches;
      var i;
      var v = new Array(maxValue + 1);
      for (i = 0; i <= maxValue; i++) {
        v[i] = 0;
      }
      var parts = value.split(",");
      for (var p = 0; p < parts.length; p++) {
        if (matches = parts[p].match(/^\*(?:\/([0-9]+))?$/)) {
          var inc = matches[1] && matches[1].length > 0 ? parseInt(matches[1], 10) : 1;
          for (i = 0; i <= maxValue; i += inc) {
            v[i] = 1;
          }
        } else if (matches = parts[p].match(/^([0-9]+)-([0-9]+)(?:\/([0-9]+))?$/)) {
          //TODO Validate correct range
          inc = matches[3] && matches[3].length > 0 ? parseInt(matches[3], 10) : 1;
          var start = parseInt(matches[1], 10);
          var end = parseInt(matches[2], 10);
          for (i = start; i <= end; i += inc) {
            v[i] = 1;
          }
        } else if (matches = parts[p].match(/^([0-9]+)$/)) {
          //TODO Validate correct range
          v[matches[1]] = 1;
        } else {
          //TODO ERROR
          return null;
        }
      }
      return v;
    }
    return parse("*", maxValue);
  }


  function RunDate(date) {
    this.date = RunDate.ceil(date);
    this.day = this.date.getDay();
    this.hour = this.date.getHours();
    this.min = this.date.getMinutes() / 5;
    this.diff = 0;
  }

  RunDate.ceil = function(date) {
    var inc = (5 - (date.getMinutes() % 5)) % 5;
    return new Date(date.getTime() - date.getMilliseconds() - (date.getSeconds() * 1000) + (inc * 60000));
  };

  RunDate.prototype.toDate = function() {
    var date = this.date;
    // 5 mins = 300000 milliseconds
    return new Date(date.getTime() + (this.diff * 300000));
  };

  RunDate.prototype.equals = function(date) {
    return this.toDate().getTime() === RunDate.ceil(date).getTime();
  };

  RunDate.prototype.add = function(mins) {
    if (mins == 0) {
      return;
    }
    this.diff += mins;
    this.min += mins;
    var div = Math.floor(this.min / 12);
    if (div > 0) {
      this.min %= 12;
      this.hour += div;
      div = Math.floor(this.hour / 24);
      if (div > 0) {
        this.hour %= 24;
        this.day += div;
        this.day %= 7;
      }
    }
  };

  RunDate.prototype.nextHour = function() {
    this.add(12 - this.min);
  };

  RunDate.prototype.nextDay = function() {
    this.add(((23 - this.hour) * 12) + (12 - this.min));
  };

  Schedule.RunDate = RunDate; //expose RunDate for tests
  return Schedule;
})();


//TODO need subclasses of action
function Action(suitePath) {
  this.suite = suitePath;
}

Action.fromData = function(data) {
  return new Action(data.suite);
};

Action.prototype.getData = function() {
  return { suite: this.suite };
};

Action.prototype.setData = function(data) {
  this.suite = data.suite;
  return this;
};

/**
 *
 * @param title
 * @param action
 * @param schedule
 * @param [index]
 * @constructor
 */
function Job(title, action, schedule, index, nextRun) {
//TODO Job should be changed to accept an action and schedule object
  this.title = title;
  this.action = action;
  this.schedule = schedule;
  this.index = index; //optional
  this.nextRun = nextRun && nextRun !== 0 ? new Date(nextRun) : null;
  this.lastRun = null;
  this.startTime = null;
  this.duration = 0;
}

Job.fromData = function(data) {
  return new Job(data.title, Action.fromData(data.action), Schedule.fromData(data.schedule), data.index, data.nextRun);
};

Job.prototype.getData = function() {
  return { title: this.title, index: this.index, action: this.action.getData(), schedule: this.schedule.getData(), nextRun: this.nextRun ? this.nextRun.getTime() : 0 };
};

Job.prototype.setData = function(data) {
  this.title = data.title;
  this.index =  data.index;
  this.action.setData(data.action);
  this.schedule.setData(data.schedule);
  this.nextRun = data.nextRun && data.nextRun !== 0 ? new Date(data.nextRun) : null;
  return this;
};

var PriorityQueue = (function () {

  // If the compareFn returns that the two objects are equal, the newly inserted element will be inserted after the old one
  function PriorityQueue(compareFn) {
    this.data = [];
    this.compare = compareFn || _compareFn;
  }

  PriorityQueue.prototype.enqueue = function(value, weight) {
    var args = Array.prototype.slice.call(arguments); //Convert all arguments to a real array
    var last = this.data.length;
    // This is a poor insert function, if it becomes a bottleneck, write a new one that inserts new elements at the after the equal element
    if (last === 0 || this._compare(args, this.data[0]) < 0) {
      this.data.unshift(args);
    } else {
      while (--last > 0 && this._compare(args, this.data[last]) < 0) {
      }
      this.data.splice(last+1, 0, args);
    }
  };

  PriorityQueue.prototype.dequeue = function() {
    if (this.data.length > 0) {
      return this.data.shift();
    }
    return null;
  };

  PriorityQueue.prototype.peek = function() {
    if (this.data.length > 0) {
      return this.data[0];
    }
    return null;
  };

  PriorityQueue.prototype.remove = function(value) {
    //remove all elements that have value in them
    var items = 0;
    var last = this.data.length;
    while (--last > 0) {
      if (this.data[last][0] === value) {
        this.data.splice(last, 1);
        items++;
      }
    }
    return items;
  };

  PriorityQueue.prototype.clear = function() {
    this.data = [];
  };

  PriorityQueue.prototype._compare = function(a, b) {
    return this.compare.call(this, a, b);
  };

  function _compareFn(a, b) {
    // default compare function, ignores the value and compares all the weights
    for (var i = 1; i < a.length; i++) {
      if (a[i] < b[i]) {
        return -1;
      } else if (a[i] > b[i]) {
        return 1;
      }
    }
    return 0;
  }

  return PriorityQueue;
})();


function Scheduler(jobs, runFn) {
  this.jobs = jobs;
  this.runFn = runFn;
  this.queue = new PriorityQueue(function (a, b) {
    // Compare the time in milliseconds
    if (a[1] < b[1]) {
      return -1;
    } else if (a[1] > b[1]) {
      return 1;
    }
    // If the time is the same, order on the job index if it going to be run again at the same time
    var a_prev = a.length == 4 ? a[3] : 0;
    var b_prev = b.length == 4 ? b[3] : 0;
    // If any of the jobs is not a repeat at the same time, use index in the job order
    if ((a_prev > 0 && a[1] != a_prev) || (b_prev > 0 && b[1] != b_prev)) {
      if (a[2] < b[2]) {
        return -1;
      } else if (a[2] > b[2]) {
        return 1;
      }
    }
    return 0;
  });
  this.nextJob = null;
  this.nextRun = null;
  this.active = false;  //true = Scheduler is running jobs on their schedule
  this.running = false; //true = Job is currently running
  this.timer = null;
  this.activity = [];
  this.logDebug("Scheduler created");
  //this.update(jobs);  //this.start would call update and schedule the first job
}

Scheduler.fromData = function(data, runFn) {
  var jobs = data.map(function(job) {
    return Job.fromData(job);
  });
  return new Scheduler(jobs, runFn);
};

Scheduler.prototype.logDebug = function(msg) {
  this.activity.push(this._dateString() + " " + msg);
};

Scheduler.prototype.logInfo = function(msg) {
  this.activity.push(this._dateString() + " " + msg);
};

Scheduler.prototype.logWarn = function(msg) {
  this.activity.push(this._dateString() + " WARNING: " + msg);
};

Scheduler.prototype.getData = function() {
  return this.jobs.map(function(job) {
    return job.getData();
  });
};

Scheduler.prototype.setData = function(data) {
  var self = this;
  var jobs = data.map(function(job) {
    return (job.index && job.index >= 0 && job.index < self.jobs.length) ? self.jobs[job.index].setData(job) : Job.fromData(job);
  });
  this.update(jobs);
  return this;
};

Scheduler.prototype.hasJobs = function() {
  return this.jobs && this.jobs.length > 0;
};

Scheduler.prototype.pendingJobCount = function() {
  if (this.hasJobs()) {
    var now = this._now();
    var pending = this.jobs.filter(function (job) {
      return job.nextRun && job.nextRun.getTime() <= now;
    });
    return pending.length;
  }
  return 0;
};

Scheduler.prototype.resetNextRun = function() {
  if (this.hasJobs()) {
    for (var i = 0; i < this.jobs.length; i++) {
      this.jobs[i].nextRun = null;
    }
  }
};

Scheduler.prototype.isActive = function() {
  return this.active;
};

Scheduler.prototype.isJobRunning = function() {
  return this.running;
};

Scheduler.prototype.start = function() {
  this.active = true;
  this.logDebug(" Scheduler started ");
  this.update();
};

Scheduler.prototype.stop = function() {
  this.active = false;
  this._sleep();  //Cancel sleep if sleeping
  this.logDebug(" Scheduler stopped" + (this.isJobRunning() ? ' (a job is running)' : ''));
  //TODO clear all stuff
};

Scheduler.prototype.update = function(jobs) {
  if (jobs) {
    this.jobs = jobs;
    this.logDebug(" updated jobs");
  }
  this.queue.clear();
  for (var i = 0; i < this.jobs.length; i++) {
    var job = this.jobs[i];
    job.index = i;
    if (!job.nextRun) {
      job.nextRun = job.schedule.next();
    }
    if (job.nextRun) {
      this.logDebug("Job " + job.title + " nextRun = " + this._dateString(job.nextRun));
      this.queue.enqueue(job, job.nextRun.getTime(), i);
    } else {
      this.logDebug("Ignoring job " + job.title + ". Schedule is not valid");
    }
  }
  this.scheduleNextJob();
};

Scheduler.prototype.scheduleNextJob = function() {
  if (this.active) {
    var job = this.queue.dequeue();
    if (job) {
      this.nextJob = job[0];
      this.nextRun = this.nextJob.nextRun;
      if (this._now() >= this.nextRun.getTime()) {
        this._tick();
      } else {
        this._sleep(this.nextRun.getTime() - this._now());
      }
    } else {
      //We have no more jobs :(
      this.nextRun = null;
    }
  }
};

Scheduler.prototype._sleep = function(milliseconds) {
  if (this.timer) {
    this.logDebug("sleep cancelled");
    window.clearTimeout(this.timer);
    this.timer = null;
  }
  if (milliseconds) {
    var self = this;
    this.logDebug("sleeping for " + milliseconds + " milliseconds");
    this.timer = window.setTimeout(function() {
      self.timer = null;
//      self.logDebug(" awake from sleep ");
      self._tick();
    }, milliseconds);
  }
};

Scheduler.prototype._tick = function() {
  if (this.running) {
    //wait for current job to complete and check after 30 seconds
    this.logDebug("_tick - waiting for job to finish");
    this._sleep(30000);  //30 seconds
  } else if (this.active && this.nextJob && (this._now() - this.nextRun.getTime() > -1000)) {
    //Time to kick off next job
    this._runJob(this.nextJob);
    //TODO start watch dog to abort / defib the job
  } else if (this.active && this.nextJob  && (this._now() - this.nextRun.getTime() < 0)) {
    this.logWarn("Unreliable clock detected. Trying to compensate but the jobs may not start at expected times. Current drift is " + (this._now() - this.nextRun.getTime()) + " milliseconds" );
    this._sleep(this.nextRun.getTime() - this._now());
  } else {
    this.logDebug("_tick - condition failed. Active: " + this.active + ", nextRun: " + this.nextRun + ", nextJob: " + (this.nextJob ? "not null" : "null") + ", time diff " + (this._now() - this.nextRun.getTime()));
  }
};

Scheduler.prototype._now = function() { //override to allow faster testing
  return Date.now();
};

function _pad2(num) {
  return num < 10 ? '0' + num : num;
}

Scheduler.prototype._dateString = function(d) {
  d = d || new Date(this._now());
  return d.getFullYear() +
    '-' + _pad2( d.getMonth() + 1 ) +
    '-' + _pad2( d.getDate() ) +
    ' ' + _pad2( d.getHours() ) +
    ':' + _pad2( d.getMinutes() ) +
    ':' + _pad2( d.getSeconds() );
};

Scheduler.prototype._runJob = function(job) {
  this.running = true;
  job.startTime = new Date(this._now());
  this.logInfo("Starting job " + job.title);
  this.logDebug("scheduled time was " + (job.nextRun ? this._dateString(job.nextRun) : ' not valid'));
  if (this.runFn) {
    var self = this;
    job.done = function (result) {  // calling done on the job will mark it as finished and reschedule it
      self._jobFinished(job, result);
    };
    this.runFn(job);
  } else {
    //TODO throw exception as we cannot proceed without a job runner
  }
};

Scheduler.prototype._jobFinished = function(job, result) {
  job.done = null;
  job.duration = this._now() - job.startTime.getTime();
  job.result = result;
  job.startTime = null;
  job.lastRun = job.nextRun;
  this.logDebug(" job " + job.title + " done, duration " + Math.ceil(job.duration / 1000) + " seconds. " + job.result);
  this.running = false;
  job.nextRun = null;
  // TODO raise a notification
  if (!job.deleted) {
    job.nextRun = job.schedule.next(null, job.lastRun);
    if (job.nextRun) {
      this.logDebug("Job " + job.title + " nextRun = " + this._dateString(job.nextRun));
      this.queue.enqueue(job, job.nextRun.getTime(), job.index, job.lastRun.getTime());
    } else {
      this.logDebug("Ignoring job " + job.title + ". Schedule is not valid");
    }
  }
  this.scheduleNextJob();
};
