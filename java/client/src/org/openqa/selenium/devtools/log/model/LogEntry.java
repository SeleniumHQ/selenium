package org.openqa.selenium.devtools.log.model;

import static java.util.logging.Level.ALL;
import static java.util.logging.Level.INFO;
import static java.util.logging.Level.SEVERE;
import static java.util.logging.Level.WARNING;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.devtools.log.Log;
import org.openqa.selenium.devtools.network.model.MonotonicTime;
import org.openqa.selenium.json.JsonInput;

import java.util.Map;
import java.util.Objects;
import java.util.logging.Level;

public class LogEntry {

  private final String source;
  private final String level;
  private final String text;
  private final MonotonicTime timestamp;

  public LogEntry(String source, String level, String text, MonotonicTime timestamp) {
    this.source = Objects.requireNonNull(source);
    this.level = Objects.requireNonNull(level);
    this.text = Objects.requireNonNull(text);
    this.timestamp = Objects.requireNonNull(timestamp);
  }

  public String getSource() {
    return source;
  }

  public String getLevel() {
    return level;
  }

  public String getText() {
    return text;
  }

  public MonotonicTime getTimestamp() {
    return timestamp;
  }

  public org.openqa.selenium.logging.LogEntry asSeleniumLogEntry() {
    Level level;
    switch (getLevel()) {
      case "error":
        level = SEVERE;
        break;

      case "verbose":
        level = ALL;
        break;

      case "warning":
        level = WARNING;
        break;

      default:
        level = INFO;
        break;
    }

    return new org.openqa.selenium.logging.LogEntry(level,
                                                    timestamp.getTimeStamp().toEpochMilli(),
                                                    getText());
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "source", getSource(),
        "level", getLevel(),
        "text", getText(),
        "timestamp", getTimestamp());
  }

  private static LogEntry fromJson(JsonInput input) {
    String source = null;
    String level = null;
    String text = null;
    MonotonicTime timestamp = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "level":
          level = input.nextString();
          break;

        case "source":
          source = input.nextString();
          break;

        case "text":
          text = input.nextString();
          break;

        case "timestamp":
          timestamp = MonotonicTime.parse(input.nextNumber());
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new LogEntry(source, level, text, timestamp);
  }
}
