/*
 * SeleniumScheduler - Interface Scheduler with Selenium IDE
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

function SeleniumScheduler(editor) {
  this.editor = editor;
  var jobRunner = new JobRunner(editor);
  this.scheduler = Scheduler.fromData(FileUtils.readJSONStoredFile('scheduler.json', []), function(job) {
    jobRunner.run(job);
  });
  this.jobRunner = jobRunner;
  this.schedulerPostResults = new PostResults(editor, this, jobRunner);
  this.schedulerSaveHTMLResults = new SaveHTMLResults(editor, this, jobRunner);
  this.schedulerMemoryWatcher = new MemoryWatcher(editor, this, jobRunner);
  this.jobRunnerWatchDog = new JobRunnerWatchDog(editor, this, jobRunner);
  //TODO plugins, plugin dependency
  this.plugins = {};
}

SeleniumScheduler.prototype.addPlugin = function(id, ctorFn) {
  this.plugins[id] = ctorFn(this.editor, this, this.jobRunner);
};

function JobRunner(editor) {
  this.editor = editor;
  this.job = null;
  var self = this;
  editor.app.addObserver({
    testSuitePlayDone: function (result) {
      if (self.job) {
        var job = self.job;
        self.job = null;
        self.notify('jobComplete', job, result);
        var resultMsg = "Played " + result.ran;
        resultMsg += result.failed ? ", " + result.failed + " failed" : '';
        resultMsg += result.total - result.ran > 0 ? ", " + (result.total - result.ran) + " skipped" : '';
        resultMsg += result.total == result.ran && result.failed == 0 ? ", all passed" : ", " + (result.ran - result.failed) + " passed";
        job.done(resultMsg);
        //TODO write the scheduler data here?
      }
    }
  });
}

JobRunner.prototype.run = function(job) {
  this.job = job;
  this.editor.health.increaseCounter('JobRunner', 'Run');
  this.editor.infoPanel.logView.clear();  //TODO convert into an option
  this.editor.getUserLog().info("Playing scheduled suite" + (job.title ? ' ' + job.title : ''));
  // If we use this.editor.loadRecentTestCase, there will be a confirmation dialog, which would stop execution
  //TODO check for changes first
  if (job.action && job.action.suite && job.action.suite.length > 0) {
    this.editor.app.loadTestCaseWithNewSuite(job.action.suite);
  }
  var resultsFolder = FileUtils.getStoredTimeStampedFile('job_results');
  resultsFolder.append(FileUtils.getSafeFilename(job.title));
  //The following code is out of the above if block as it is a feature. Allow scheduling the currently open test suite if no suite is specified in the job
  //TODO check if it really loaded!
  this.notify('jobStarting', job, resultsFolder.path);
  this.editor.playTestSuite();
};

JobRunner.prototype.abort = function() {
  if (this.job) {
    //TODO stop the job if it is really running. debugger.stop???
    var job = this.job;
    this.job = null;
    this.editor.getUserLog().warn("Aborting job" + (job.title ? ' ' + job.title : ''));  //TODO add more information about the test case and command
    this.editor.selDebugger.pause();
    var self = this;
    window.setTimeout(function() {
      if (self.editor.selDebugger.state == Debugger.PAUSE_REQUESTED) {
        self.editor.getUserLog().error("Abort job failed. Debugger still in pause requested mode, trying to proceed to next job");
      }
      self.notify('jobAborted', job);
      job.done(self.editor.app.getTestSuite().tests.length, self.editor.testSuiteProgress.runs, self.editor.testSuiteProgress.failures);
    }, 30000);
  }
};
observable(JobRunner);


function SaveHTMLResults(editor, seleniumScheduler, jobRunner) {
  this.editor = editor;
  var self = this;
  if (jobRunner) {
    jobRunner.addObserver({
      jobComplete: function (job, result) {
        if (editor.testResultsExporter && editor.testResultsExporter.getTestSuiteResults) {
          try {
            var content = editor.testResultsExporter.getTestSuiteResults();
            if (content != null) {
              FileUtils.writeUTF8nsIFile(FileUtils.getStoredTimeStampedFile('job_results', FileUtils.getSafeFilename(job.title + ' on '), '.htm'), content);
            }
          } catch(e) {
          }
        }
      }
    });
  }
}

SaveHTMLResults.prototype.getFolder = function() {
  return FileUtils.getSeleniumIDEFolder('job_results').path;
};


function PostResults(editor, seleniumScheduler, jobRunner) {
  this.editor = editor;
  this.server = "http://localhost:3000/api/result";
  this.dispatcher = new Dispatcher(null, this.server);
  var self = this;
  if (jobRunner) {
    jobRunner.addObserver({
      jobComplete: function (job, result) {
        var server = self.editor.app.options.jobResultsServer || "";
        server = server.trim();
        if (server.length > 0) {  // set server to an empty string to turn off sending results
          if (server != self.server) {
            self.server = server;
            self.dispatcher.setServer(server);
          }
          self.editor.health.addEvent('postResults', 'sending results to ' + self.server);
          var testSuite = self.editor.app.getTestSuite();
          var data = {
            title: job.title,
            schedule: job.schedule.getData(),
            scheduledTime: job.nextRun.getTime(),
            startTime: job.startTime.getTime(),
            suite: testSuite.result()
          };
          self.dispatcher.send(data);
        }
      }
    });
  }
}


function MemoryWatcher(editor, seleniumScheduler, jobRunner) {
  this.editor = editor;
  this.lastDump = null;
  this.timeInterval = 3540000;  //59 minutes in milliseconds
  var self = this;
  if (jobRunner) {
    jobRunner.addObserver({
      jobComplete: function (job, result) {
        self.watch();
      }
   });
  }
}

MemoryWatcher.prototype.watch = function() {
  if (this.lastDump == null || Date.now() - this.lastDump.getTime() >= this.timeInterval) {
    this.lastDump = new Date();
    var file = FileUtils.getStoredTimeStampedFile('memory', 'memory-report_', '.json.gz');
    this.dump(file.path);
  }
};

MemoryWatcher.prototype.dump = function(filename) {
  this.editor.log.info("dumping memory to " + filename);
  try {
    var dumper = Components.classes["@mozilla.org/memory-info-dumper;1"].getService(Components.interfaces.nsIMemoryInfoDumper);
    dumper.dumpMemoryReportsToNamedFile(filename, function(){}, null, false);
    //TODO cleanup old reports
  } catch (e) {
    this.editor.log.error("Error dumping memory." + e);
  }
};


function JobRunnerWatchDog(editor, seleniumScheduler, jobRunner) {
  this.editor = editor;
  this.jobRunner = jobRunner;
  this.timer = null;
  this.testCase = null;
  this.timeStamp = 0;
  var self = this;
  if (jobRunner) {
    jobRunner.addObserver({
      jobStarting: function (job) {
        self._tick();
      },

      jobComplete: function (job, result) {
        window.clearTimeout(self.timer);
        self.timer = null;
      },

      jobAborted: function (job) {
        window.clearTimeout(self.timer);
        self.timer = null;
      }
    });
  }
}

JobRunnerWatchDog.prototype._tick = function() {
  var milliseconds = 300000;  // 5 mins
  var self = this;
  self.timer = window.setTimeout(function() {
    self.watch();
    if (self.timer) {
      self._tick();
    }
  }, milliseconds);
};

JobRunnerWatchDog.prototype.watch = function() {
  var testCase = this.editor.getTestCase();
  if (testCase) {
    if (testCase === this.testCase && testCase.debugContext.runTimeStamp === this.timeStamp) {
      if (Date.now() - this.timeStamp > 500000) { //9 mins, is this too long enough?
        this.editor.health.increaseCounter('JobRunnerWatchDog', 'Kill');
        this.editor.getUserLog().warn("Dead test detected, going to kill it");  //TODO add more information about the job and test case and command
        //TODO retry before aborting?
        //TODO options retry command, and retry suite, one time, specified number of times, maybe even skip the command and continue the test
        //TODO send notification so others interested can do stuff
        this.jobRunner.abort();
      }
    } else {
      this.testCase = testCase;
      this.timeStamp = testCase ? testCase.debugContext.runTimeStamp : 0;
    }
  }
};

