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
import java.util.Objects;
import java.util.logging.Level;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

public class SeleniumManagerOutput {

  private List<Log> logs;
  private Result result;

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
    private final Level level;
    private final long timestamp;
    private final String message;

    public Log(Level level, long timestamp, String message) {
      this.level = Require.nonNull("level", level);
      this.timestamp = timestamp;
      this.message = Require.nonNull("message", message);
    }

    public Level getLevel() {
      return level;
    }

    public long getTimestamp() {
      return timestamp;
    }

    public String getMessage() {
      return message;
    }

    private static Log fromJson(JsonInput input) {
      Level level = Level.FINE;
      long timestamp = System.currentTimeMillis();
      String message = "";

      input.beginObject();
      while (input.hasNext()) {
        switch (input.nextName()) {
          case "level":
            switch (input.nextString().toLowerCase()) {
              case "error":
              case "warn":
                level = Level.WARNING;
                break;

              case "info":
                level = Level.INFO;
                break;

              default:
                level = Level.FINE;
                break;
            }
            break;

          case "timestamp":
            timestamp = input.nextNumber().longValue();
            break;

          case "message":
            message = input.nextString();
            break;
        }
      }
      input.endObject();

      return new Log(level, timestamp, message);
    }
  }

  public static class Result {
    private final int code;
    private final String message;
    private final String driverPath;
    private final String browserPath;

    public Result(String driverPath) {
      this(0, null, driverPath, null);
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

    public String getMessage() {
      return message;
    }

    public String getDriverPath() {
      return driverPath;
    }

    public String getBrowserPath() {
      return browserPath;
    }

    @Override
    public String toString() {
      return "Result{"
          + "code="
          + code
          + ", message='"
          + message
          + '\''
          + ", driverPath='"
          + driverPath
          + '\''
          + ", browserPath='"
          + browserPath
          + '\''
          + '}';
    }

    @Override
    public boolean equals(Object o) {
      if (!(o instanceof Result)) {
        return false;
      }
      Result that = (Result) o;
      return code == that.code
          && Objects.equals(message, that.message)
          && Objects.equals(driverPath, that.driverPath)
          && Objects.equals(browserPath, that.browserPath);
    }

    @Override
    public int hashCode() {
      return Objects.hash(code, message, driverPath, browserPath);
    }

    private static Result fromJson(JsonInput input) {
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
