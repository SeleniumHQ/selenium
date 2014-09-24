/*
 * Health Service - provide a service to collect errors, events and statistics
 *
 * Copyright 2014 Samit Badle
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
function HealthService() {
  this.startTime = Date.now();
  this.diagProviders = {};
  this.handlers = {};
  this.key = 0;
  this.alerts = true;

  this.diags = {};
  this.events = [];
  this.metrics = {};
  this.stats = {};
}

/**
 * reset all collected data
 */
HealthService.prototype.reset = function() {
  this.diags = {};
  this.events = [];
  this.metrics = {};
  this.stats = {};
  this.addEvent('HealthService', 'reset');
};

/**
 * Add a diagnostic in a script at load time
 * @param name the result of the diagnostic is stored with this name
 * @param object needs a runDiagnostic fn
 */
HealthService.addDiagnostic = function(name, object) {
  if (!this.diagProviders) {
    this.diagProviders = {};
  }
  this.diagProviders[name] = object;
};

/**
 * Add a diagnostic to an instance of this object
 * @param name the result of the diagnostic is stored with this name
 * @param object needs a runDiagnostic fn
 */
HealthService.prototype.addDiagnostic = function(name, object) {
  this.diagProviders[name] = object;
};

/**
 * Run all added diagnostics
 */
HealthService.prototype.runDiagnostics = function() {
  // run those added to the instance
  var results = this._runDiagnostics(this.diagProviders, {});
  // run those added to the class
  this.diags = this._runDiagnostics(HealthService.diagProviders, results);
};

HealthService.prototype._runDiagnostics = function(providers, results) {
  if (providers) {
    for (var k in providers) {
      if (providers.hasOwnProperty(k)) {
        try {
          results[k] = providers[k].runDiagnostic();
        } catch (e) {
          results[k] = "Error: " + e;
        }
      }
    }
  }
  return results;
};

/**
 * Choose if any uncaught errors should be displayed
 */
HealthService.prototype.showAlerts = function(value) {
  this.alerts = value ? true : false;
};

HealthService.prototype._newKey = function() {
  return ++this.key;
};

/**
 * Add health handlers
 */
HealthService.prototype.attach = function(win, component) {
  if (win) {
    var oldOnError = win.onerror;
    win.__side_health_key = Date.now() + component + this._newKey();
    this.handlers[win.__side_health_key] = {
      component: component,
      oldOnError: oldOnError
    };
    var self = this;
    win.onerror = function SIDEErrorHandler(msg, url, line) {
      self.addError(component, "UncaughtException", msg, url, line);
      if (self.alerts) {
        alert("Caught onerror. Msg: " + msg + ", url: " + url + ", line: " + line);
      }
      return oldOnError ? oldOnError(msg, url, line) : false;
    };
    this.addEvent('HealthService', 'attached: ' + component);
  }
};

/**
 * Remove the attached health handlers
 */
HealthService.prototype.detach = function(win) {
  if (win && win.__side_health_key && this.handlers[win.__side_health_key]) {
    var info = this.handlers[win.__side_health_key];
    this.handlers[win.__side_health_key] = null;
    win.onerror = info.oldOnError;
    this.addEvent('HealthService', 'detached: ' + info.component);
  }
};

/**
 * Add an event for a component
 */
HealthService.prototype.addEvent = function(component, event) {
  this.events.push({
    at: Date.now(),
    component: component,
    type: 'Event',
    event: event
  });
};

/**
 * Add an error for a component
 */
HealthService.prototype.addError = function(component, event, msg, url, line) {
  this.events.push({
    at: Date.now(),
    component: component,
    type: 'Error',
    event: event,
    msg: msg,
    url: url,
    line: line
  });
};

/**
 * Increase the counter in a component
 */
HealthService.prototype.increaseCounter = function(component, counter) {
  if (!this.stats[component]) {
    this.stats[component] = {};
    this.stats[component][counter] = 0;
  }
  this.stats[component][counter]++;
};

/**
 * Store a metric in a component
 */
HealthService.prototype.setMetric = function(component, metric, data) {
  if (!this.metrics[component]) {
    this.metrics[component] = {};
  }
  this.metrics[component][metric] = data;
};

/**
 * Retrieve a metric in a component
 */
HealthService.prototype.getMetric = function(component, metric, defaultValue) {
  if (this.metrics[component]) {
    return this.metrics[component].hasOwnProperty(metric) ? this.metrics[component][metric] : defaultValue;
  }
  return defaultValue;
};

/**
 * Return the collected data
 */
HealthService.prototype.getData = function() {
  return {
    startTime: this.startTime,
    at: Date.now(),
    diags: this.diags,
    events: this.events,
    metrics: this.metrics,
    stats: this.stats
  };
};

/**
 * Return the collected data
 */
HealthService.prototype.getJSON = function() {
  return JSON.stringify(this.getData());
};

/**
 * Return the collected data so that it can be persisted to storage
 * and reset all collected data so that memory consumption is contained
 */
HealthService.prototype.flush = function() {
  var data = this.getJSON();
  this.reset();
  return data;
};
