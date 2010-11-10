/*
 * Copyright 2008 Shinya Kasatani
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

function TestSuiteProgress(id) {
    this.id = id;
    this.reset();
}

TestSuiteProgress.prototype = {
    reset: function() {
        this.failures = 0;
        this.update(0, 0, false);
    },

    update: function(runs, total, failure) {
        this.runs = runs;
        this.total = total;
        if (failure) { this.failures++; };
        var width;
        if (total > 0) {
            width = runs / total * 100;
        } else {
            width = 0;
        }
        this._getIndicator2().setAttribute("flex", 100 - parseInt(width));
        this._getIndicator().setAttribute("flex", parseInt(width));
        this._getIndicator().setAttribute("class", this.failures > 0 ? "failure" : "success");
        this._getRunsLabel().value = this.runs.toString();
        this._getFailuresLabel().value = this.failures.toString();
    },

    _getIndicator: function() {
        return $(this.id + "Indicator");
    },

    _getIndicator2: function() {
        return $(this.id + "Indicator2");
    },

    _getRunsLabel: function() {
        return $(this.id + "Runs");
    },

    _getFailuresLabel: function() {
        return $(this.id + "Failures");
    }
};
