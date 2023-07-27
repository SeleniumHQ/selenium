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
package org.openqa.selenium.manager;

import java.util.List;
import org.openqa.selenium.json.JsonInput;

public class SeleniumManagerOutput {

  public List<Log> logs;
  public Result result;

  public List<Log> getLogs() {
    return logs;
  }

  public void setLogs(List<Log> logs) {
    this.logs = logs;
  }

  public Result getResult() {
    return result;
  }

  public void setResult(Result result) {
    this.result = result;
  }

  public static class Log {
    public String level;
    long timestamp;
    public String message;

    public String getLevel() {
      return level;
    }

    public void setLevel(String level) {
      this.level = level;
    }

    public long getTimestamp() {
      return timestamp;
    }

    public void setTimestamp(long timestamp) {
      this.timestamp = timestamp;
    }

    public String getMessage() {
      return message;
    }

    public void setMessage(String message) {
      this.message = message;
    }
  }

  public static class Result {
    public int code;
    public String message;
    public String driverPath;
    public String browserPath;

    public Result(String driverPath) {
      this.driverPath = driverPath;
    }

    public Result(int code, String message, String driverPath, String browserPath) {
      this.code = code;
      this.message = message;
      this.driverPath = driverPath;
      this.browserPath = browserPath;
    }

    public int getCode() {
      return code;
    }

    public void setCode(int code) {
      this.code = code;
    }

    public String getMessage() {
      return message;
    }

    public void setMessage(String message) {
      this.message = message;
    }

    public String getDriverPath() {
      return driverPath;
    }

    public void setDriverPath(String driverPath) {
      this.driverPath = driverPath;
    }

    public String getBrowserPath() {
      return browserPath;
    }

    public void setBrowserPath(String browserPath) {
      this.browserPath = browserPath;
    }

    public static Result fromJson(JsonInput input) {
      int code = 0;
      String message = null;
      String driverPath = null;
      String browserPath = null;

      input.beginObject();
      while (input.hasNext()) {
        switch (input.nextName()) {
          case "code":
            code = input.read(Integer.class);
            break;

          case "message":
            message = input.read(String.class);
            break;

          case "driver_path":
            driverPath = input.read(String.class);
            break;

          case "browser_path":
            browserPath = input.read(String.class);
            break;

          default:
            input.skipValue();
            break;
        }
      }
      input.endObject();

      return new Result(code, message, driverPath, browserPath);
    }
  }
}
