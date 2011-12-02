/*
Copyright 2007-2011 WebDriver committers
Copyright 2007-2011 Google Inc.
Portions copyright 2011 Software Freedom Conservatory

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;

import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.logging.Logs;

import java.util.List;
import java.util.logging.Level;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RemoteLogs implements Logs {
  protected ExecuteMethod executeMethod;

  private static final String TYPE_KEY = "type";

  public RemoteLogs(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  public LogEntries get(String logType) {
    String raw = (String) executeMethod.execute(DriverCommand.LOGS_DRIVER,
        ImmutableMap.of(TYPE_KEY, logType));
    Pattern pattern = Pattern.compile("\\{.*?\"\\}\n");
    Matcher matcher = pattern.matcher(raw);

    List<LogEntry> entries = Lists.newArrayList();

    while (matcher.find()) {
      try {
        JSONObject jsonObject = new JSONObject(matcher.group());
        entries.add(new LogEntry((Integer) jsonObject.get("level"),
            (Long) jsonObject.get("timestamp"), (String) jsonObject.get("message")));
      } catch (JSONException e) {
        throw new WebDriverException("Failed to parse logs. Raw result: " + raw, e);
      }
    }
    return new LogEntries(entries);
  }
}
