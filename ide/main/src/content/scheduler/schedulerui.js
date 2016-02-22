/*
 * Scheduler Dialog
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

/*
  TODO *Discard changes on cancel, keep data for existing jobs
  TODO *suite run information in activity
  TODO *Job ordering
  TODO *Cancel confirmation
  TODO *persistence of scheduled jobs
  TODO *Checkbox to turn scheduler on and off
  TODO *Consistent buttons to add, remove jobs on all platforms
  TODO *Common schedules in the advanced drop down list
  TODO Next run date in the jobs list
  TODO English like descriptions in the jobs list
  TODO *Accept English like strings for setting schedule like "[every] sun at 4pm" "every 5 mins" "at 8:00" "at 8 in the morning" "every 8 hours on weekdays"
  TODO  double click / *press enter on a list item to move to the edit job tab
  TODO *press enter on the advanced cron textbox to set it
  TODO -keep statistics history of each job run (use the test dashboard)
  TODO -keep results of each test run (use the test dashboard)
  TODO -persistence of history (use the test dashboard)
  TODO trap any errors that occur during automated runs
  TODO *automatically set the job name based on the file name of the suite
  TODO menu items
  TODO copy / paste support
  TODO Undo support
  TODO Start selenium IDE with firefox? and launch scheduler
  TODO detect and alert invalid schedules in the UI itself
  TODO prevent alerts and confirms while running jobs, either by checking that they won't occur, replacing the alert methods or separating UI and functionality
 */

var editor = window.arguments[0];
var health;
if (editor && editor.health) {
  health = editor.health;
  health.attach(window, 'SchedulerUI');
}
var cronExpressionPlugins = [];
var jobsData = [];
var jobRunNow = null;
var currentJob = null;
var currentJobIndex = -1;
var jobList = null;
// UI
var jobTab = null;
var removeButton = null;
var runNowCheckbox = null;
var nextRunLabel = null;

/**
 *
 * @param what
 * @param how
 * @param [start]
 * @private
 */
function _setCheckboxes(what, how, start) {
  start = start ? start : 0;
  var length = what == 'day' ? 7 : 12;
  var end = start + length;
  var headerCheckbox = document.getElementById(what + (start == 0 ? '' : '2') + '-select');
  var checked = 0;
  for (var i = start; i < end; i++) {
    document.getElementById(what + i).checked = how[i] == 1;
    checked += how[i] == 1 ? 1 : 0;
  }
  headerCheckbox.checked = checked == length;
}

function loadSchedule(schedule) {
  _setCheckboxes('day', schedule.days);
  _setCheckboxes('hour', schedule.hours);
  _setCheckboxes('hour', schedule.hours, 12);
  _setCheckboxes('minute', schedule.mins);
  if (currentJob.nextRun) {
    nextRunLabel.value = new Date(currentJob.nextRun).toLocaleString();
    nextRunLabel.className = '';
  } else {
    updateNextRun();
  }
}

function loadJob(job) {
  if (currentJob) {
    saveJob();
  }
  currentJob = job;
  //Load the job details
  document.getElementById('jobTitle').value = job.title;
  document.getElementById('suitePath').value = job.action.suite;
  jobRunNow = job.runNow === null ? (job.nextRun && job.nextRun < Date.now() ? true : false) : job.runNow;
  runNowCheckbox.checked = jobRunNow;
  //Load the schedule
  loadSchedule(job.schedule);
}

function updateNextRun() {
  //TODO remember if you set this on timeout, the current job may have changed, but, it may not matter
  var missingDays = 0;
  var missingHours = 0;
  var missingMins = 0;
  var days = new Array(7);
  var hours = new Array(24);
  var mins = new Array(12);
  var i;
  for (i = 0; i < days.length; i++) {
    days[i] = document.getElementById('day' + i).checked ? 1 : 0;
    missingDays += days[i];
  }
  for (i = 0; i < hours.length; i++) {
    hours[i] = document.getElementById('hour' + i).checked ? 1 : 0;
    missingHours += hours[i];
  }
  for (i = 0; i < mins.length; i++) {
    mins[i] = document.getElementById('minute' + i).checked ? 1 : 0;
    missingMins += mins[i];
  }
  if (missingDays > 0 && missingHours > 0 && missingMins > 0) {
    var schedule = new Schedule(days, hours, mins);
    //TODO cache this so we can change to next one if it is past due
    try {
      var nextRun = schedule.next();
      nextRunLabel.value = new Date(nextRun).toLocaleString();
      nextRunLabel.className = '';
//      currentJob.scheduleError = false;
    } catch (e) {
      nextRunLabel.value = "Error getting nextRun";
      nextRunLabel.className = "nextRunError";
//      currentJob.scheduleError = true;
    }
  } else {
    //Incomplete schedule
    nextRunLabel.value = "Needs " + (missingDays == 0 ? 'days' : missingHours == 0 ? 'hours' : 'minutes');
    nextRunLabel.className = "nextRunError";
  }
}

function updateCurrentJob(obj, attr, value) {
  if (obj[attr] != value) {
    obj[attr] = value;
    currentJob.changed = true;
  }
}

function saveJob() {
  if (currentJob) {
    //Save job details
//    LOG.debug("saving job");
    updateCurrentJob(currentJob, 'title', document.getElementById('jobTitle').value);
    updateCurrentJob(currentJob.action, 'suite', document.getElementById('suitePath').value);
    //Save the schedule
    var days = new Array(7);
    var hours = new Array(24);
    var mins = new Array(12);
    var data = currentJob.schedule;
    var changed = false;
    var i;
    for (i = 0; i < days.length; i++) {
      days[i] = document.getElementById('day' + i).checked ? 1 : 0;
      changed = changed || data.days[i] == days[i];
    }
    for (i = 0; i < hours.length; i++) {
      hours[i] = document.getElementById('hour' + i).checked ? 1 : 0;
      changed = changed || data.hours[i] == hours[i];
    }
    for (i = 0; i < mins.length; i++) {
      mins[i] = document.getElementById('minute' + i).checked ? 1 : 0;
      changed = changed || data.mins[i] == mins[i];
    }
    if (changed) {
      currentJob.schedule = new Schedule(days, hours, mins);
      currentJob.changed = true;
      try {
        var nextRun = currentJob.schedule.next();
        currentJob.scheduleError = false;
      } catch (e) {
        currentJob.scheduleError = true;
      }
    }
    if (runNowCheckbox.checked != jobRunNow) {
      currentJob.runNow = !jobRunNow;
      currentJob.changed = true;
    }
    if (currentJob.changed) {
      if (currentJobIndex >= 0) {
        jobList.updateItem(currentJobIndex);
//        LOG.debug("refreshed item index " + currentJobIndex);
      } else {
        //refresh all items
      }
    }
    currentJob = null;
  }
}

function getScheduler() {
  if (editor && editor.scheduler) {
    return editor.scheduler;
  }
  return null;
}

function initScheduler() {
  //get elements for UI
  jobTab = document.getElementById('job-tab');
  removeButton = document.getElementById('remove-job-button');
  runNowCheckbox = document.getElementById('jobRunNow');
  nextRunLabel = document.getElementById('jobNextRun');

  var s = getScheduler();
  if (s) {
    document.getElementById('schedulerState').checked = s.isActive ? true : false;
    s.stop();
    // TODO show the running status as well and a means to override it
    var activityList = document.getElementById('activity-list');
    for (var i = s.activity.length -1; i >= 0; i--) {
      activityList.appendItem(s.activity[i]);
    }
    jobsData = s.getData() || [];
    jobsData.forEach(function(job) {
      job.runNow = null;
    });
    jobList = new DnDReorderedListbox(
        document.getElementById('job-list'),
        jobsData,
        function (job) {
          return job.title;
        },
        true,
        function (srcIndex, destIndex) {
//          LOG.debug("onDrop: " + srcIndex + ", " + destIndex);
          saveJob();
        }
    );
    for (i = 0; i < 7; i++) {
      document.getElementById('day' + i).addEventListener('click', updateNextRun, false);
    }
    for (i = 0; i < 24; i++) {
      document.getElementById('hour' + i).addEventListener('click', updateNextRun, false);
    }
    for (i = 0; i < 12; i++) {
      document.getElementById('minute' + i).addEventListener('click', updateNextRun, false);
    }
    if (jobsData.length == 0) {
      //If there are no jobs, create a new one
      addJob();
    } else {
      jobList.selectItem(0);
    }
  } else {
    alert('Error: could not connect to the Scheduler service.');
  }
}

function saveScheduler() {
  if (currentJob) {
    saveJob();
  }

  var s = getScheduler();
  if (s) {
    //Process the runNow flag if set and modify the nextRun so that the job is triggered
    jobsData.forEach(function(job) {
      if (job.runNow === false) {
        job.nextRun = null;
      } else if (job.runNow === true) {
        if ( !job.nextRun || job.nextRun >= Date.now()) {
          job.nextRun = Date.now() - 1;
        }
      }
    });
    //Update as we could have removed the existing jobs
    s.setData(jobsData);
    FileUtils.writeJSONStoredFile('scheduler.json', jobsData);
    if (health) {
      health.increaseCounter('SchedulerUI', 'save');
      if (jobsData.length > health.getMetric('SchedulerUI', 'maxJobs', 0)) {
        health.setMetric('SchedulerUI', 'maxJobs', jobsData.length);
      }
    }
    if (jobsData.length > 0) {
      if (document.getElementById('schedulerState').checked) {
        s.start();
      }
    }
  }
  if (health) {
    health.detach(window);
  }
  return true;
}

function cancelScheduler() {
  if (PromptService.yesNo("Do you want to discard changes and stop the scheduler?", "Cancel?").yes) {
    jobsData = null;
    if (health) {
      health.detach(window);
    }
    return true;
  }
  return false;
}

function selectJob(list) {
  saveJob();
  var index = list.selectedIndex;
  //TODO debug remove
//  LOG.debug("selectJob Index: " + index);
  currentJobIndex = index;
  if (index >= 0) {
    loadJob(jobsData[index]);
    jobTab.label = "Edit Job";
  } else {
    //TODO disable Add/Edit tab as there is no job selected!
    //We should actually never reach this, unless there is a bug somewhere
  }
}

function jobListEnter(evt) {
  if (evt.keyCode == KeyEvent.DOM_VK_RETURN) {
    if (!jobTab.disabled) {
      document.getElementById('schedulerTabs').selectedItem = jobTab;
    }
  }
}

function addJob() {
  if (currentJob) {
    saveJob();
  }
  var job = new Job('NewJob', new Action(''), new Schedule('*', '*', '*'));
  job = job.getData();
  job.runNow = null;
  jobList.selectItem(jobList.appendItem(job));
  jobTab.disabled = false;
  jobTab.label = "New Job";
  document.getElementById('schedulerTabs').selectedItem = jobTab;
  removeButton.disabled = false;
}

function removeJob() {
  if (currentJob && jobList.listBox.selectedIndex == currentJobIndex) {
    var oldIndex = currentJobIndex;
    var job = jobList.removeItem(oldIndex);
    job.deleted = true;
    var newIndex = oldIndex < jobsData.length ? oldIndex : jobsData.length - 1;
    if (newIndex >= 0) {
      jobList.selectItem(newIndex);
    } else {
      // no jobs, disable new Job tab
      document.getElementById('schedulerTabs').selectedItem = document.getElementById('jobs-tab');
      jobTab.label = "New Job";
      jobTab.disabled = true;
      removeButton.disabled = true;
    }
  }
}


function chooseFile(target, message, multi) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
  fp.init(window, message || "Select file", nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterAll);
  var res = fp.show();
  if (res == nsIFilePicker.returnOK) {
    var e = document.getElementById(target);
    if (e.value && multi) {
      e.value += ', ' + fp.file.path;
    } else {
      e.value = fp.file.path;
    }
    return e.value;
  }
  return null;
}

function chooseSuite() {
  var file = chooseFile('suitePath', 'Select test suite');
  var jobTitle = document.getElementById('jobTitle');
  if (file && (jobTitle.value == "NewJob" || jobTitle.value == '')) {
    file = file.replace(/^.*\//, '');
    file = file.replace(/\.[^.]*$/, '');
    jobTitle.value = file;
  }
}

function toggle(value, what, start) {
  start = start != null ? start : 0;
  var end = start + (what == 'day' ? 7 : 12);
  for (var i = start; i < end; i++) {
    document.getElementById(what + i).checked = value;
  }
  updateNextRun();
}


function cronExpression() {
  var e = document.getElementById('cronExpression');
  var value = e.selectedItem ? e.selectedItem.value : e.value;
  if (value) {
    //Normalise value
    value = value.replace(/\(.*\)/g, ''); //get rid of any content in () if present
    value = value.replace(/\s+/g, ' ');   //normalise whitespace
    value = value.replace(/^\s+/g, '');   //normalise whitespace
    value = value.replace(/\s+$/g, '');   //normalise whitespace

    // let the plugins do any processing if required
    if (value.length > 0) {
      for (var i = 0; i < cronExpressionPlugins.length; i++) {
        var plugin = cronExpressionPlugins[i];

        try {
          var nlp = plugin.fromString(value); //plugins should return a cron expression if they succeed
          if (nlp) {
            LOG.debug("NLP: processed [" + value + "] to [" + nlp + "]");
            value = nlp;
            break;  //The first plugin that returns a value wins
          }
        } catch (e) {
          //TODO disable this plugin! Integrate into plugin manager
        }
      }
    }

    var d = value.replace(/\s+/g, " ").replace(/^\s+/,"").split(" ");
    if (d.length >= 3) {
      try {
        var schedule = new Schedule(d[0], d[1], d[2]);
        loadSchedule(schedule);
        e.value = '';
        updateNextRun();
      } catch (e) {
        LOG.debug("Could not process schedule. Value was [" + value + "]");
      }
    }
  }
}

function cronEnter(evt) {
  if (evt.keyCode == KeyEvent.DOM_VK_RETURN) {
    cronExpression();
  }
}

var LOG = {};
LOG.debug = function (msg) {
  document.getElementById('activity-list').appendItem("Debug: " + msg);
};

//TODO integrate this into the plugin manager
cronExpressionPlugins.push(new NaturalLanguageProcessor());