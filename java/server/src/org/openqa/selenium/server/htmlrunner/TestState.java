// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.server.htmlrunner;

import static java.util.regex.Pattern.MULTILINE;

import com.google.common.base.Preconditions;
import com.google.common.base.Throwables;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class TestState {
  private static Map<String, Object> storedValues = new HashMap<>();
  private long commandTimeOut = TimeUnit.SECONDS.toMillis(30);
  private long speed = 0;

  public void sleepTight() {
    try {
      Thread.sleep(speed);
    } catch (InterruptedException e) {
      throw new RuntimeException("Unlikely: " + Throwables.getStackTraceAsString(e));
    }
  }

  public void store(String key, Object value) {
    storedValues.put(key, value);
  }

  private String getValue(String key) {
    return Preconditions.checkNotNull(key);
  }

  public String expand(String toExpand) {
    /*

    Selenium.prototype.replaceVariables = function(str) {
    var stringResult = str;

    // Find all of the matching variable references
    var match = stringResult.match(/\$\{\w+\}/g);
    if (!match) {
        return stringResult;
    }

    // For each match, lookup the variable value, and replace if found
    for (var i = 0; match && i < match.length; i++) {
        var variable = match[i]; // The replacement variable, with ${}
        var name = variable.substring(2, variable.length - 1); // The replacement variable without ${}
        var replacement = storedVars[name];
        if (replacement && typeof(replacement) === 'string' && replacement.indexOf('$') != -1) {
            replacement = replacement.replace(/\$/g, '$$$$'); //double up on $'s because of the special meaning these have in 'replace'
        }
        if (replacement != undefined) {
            stringResult = stringResult.replace(variable, replacement);
        }
    }
    return stringResult;
};
     */
    Pattern toMatch = Pattern.compile("\\$\\{(\\w+)\\}", MULTILINE);
    Matcher matcher = toMatch.matcher(toExpand);
    StringBuilder toReturn = new StringBuilder();

    int lastEnd = 0;
    while (matcher.find()) {
      // Copy from the last end into the stringbuffer
      toReturn.append(toExpand.substring(lastEnd, matcher.start()));
      // Now insert the value
      toReturn.append(getValue(matcher.group(1)));
      lastEnd = matcher.end();
    }

    // Now append the last part of the input
    toReturn.append(toExpand.substring(lastEnd));

    return toReturn.toString();
  }
}
