package org.openqa.selenium.grid.log;

import static java.time.ZoneOffset.UTC;
import static java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.TreeMap;
import java.util.logging.Formatter;
import java.util.logging.LogRecord;

class JsonFormatter extends Formatter {

  public static final Json JSON = new Json();

  @Override
  public String format(LogRecord record) {
    Map<String, Object> logRecord = new TreeMap<>();

    Instant instant = Instant.ofEpochMilli(record.getMillis());
    ZonedDateTime local = ZonedDateTime.ofInstant(instant, ZoneId.systemDefault());

    logRecord.put("log-time-local", ISO_OFFSET_DATE_TIME.format(local));
    logRecord.put("log-time-utc", ISO_OFFSET_DATE_TIME.format(local.withZoneSameInstant(UTC)));

    String[] split = record.getSourceClassName().split("\\.");
    logRecord.put("class", split[split.length - 1]);
    logRecord.put("method", record.getSourceMethodName());
    logRecord.put("log-name", record.getLoggerName());
    logRecord.put("log-level", record.getLevel());
    logRecord.put("log-message", record.getMessage());

    StringBuilder text = new StringBuilder();
    try (JsonOutput json = JSON.newOutput(text).setPrettyPrint(false)) {
      json.write(logRecord);
      text.append('\n');
    }
    return text.toString();
  }
}
