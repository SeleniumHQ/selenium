package org.openqa.selenium.devtools.console.model;

import org.openqa.selenium.devtools.console.Console;
import org.openqa.selenium.json.JsonInput;

import java.util.Objects;
import java.util.StringJoiner;

public class ConsoleMessage {

  private final String source;
  private final String level;
  private final String text;

  ConsoleMessage(String source, String level, String text) {
    this.source = Objects.requireNonNull(source);
    this.level = Objects.requireNonNull(level);
    this.text = Objects.requireNonNull(text);
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

  private static ConsoleMessage fromJson(JsonInput input) {
    String source = null;
    String level = null;
    String text = null;

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

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new ConsoleMessage(source, level, text);
  }

  @Override
  public String toString() {
    return new StringJoiner(", ", ConsoleMessage.class.getSimpleName() + "[", "]")
        .add("level='" + level + "'")
        .add("source='" + source + "'")
        .add("text='" + text + "'")
        .toString();
  }
}
